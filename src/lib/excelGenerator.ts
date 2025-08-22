import ExcelJS from 'exceljs'
import { DailyWorkData } from '../types/dailyWork'

export async function generateExcelFile(data: DailyWorkData) {
  try {
    // 템플릿 파일 로드 (public 폴더에서)
    const templatePath = '/daily-work.xlsx'
    const response = await fetch(templatePath)
    const arrayBuffer = await response.arrayBuffer()
    
    // ExcelJS로 템플릿 파일 읽기
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    
    const worksheet = workbook.getWorksheet('일일업무일지')
    
    if (!worksheet) {
      throw new Error('워크시트를 찾을 수 없습니다.')
    }
    
    // 날짜 포맷팅
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const year = date.getFullYear().toString()
      return `${year}.${month}.${day}`
    }
    
    // 셀 값 업데이트 (스타일은 보존)
    const updateCellValue = (cellAddress: string, value: string) => {
      const cell = worksheet.getCell(cellAddress)
      cell.value = value
    }

    // 기본 정보 채우기
    updateCellValue('C4', formatDate(data.date))
    updateCellValue('E4', `${data.startTime} ~ ${data.endTime}`)  
    updateCellValue('C5', data.department)
    updateCellValue('E5', data.name)
    
    // 업무 내용 셀 클리어 (Row 8-15)
    for (let row = 8; row <= 15; row++) {
      updateCellValue(`B${row}`, '') // 업무내용
      updateCellValue(`D${row}`, '') // 완료여부
      updateCellValue(`E${row}`, '') // 비고
    }
    
    // 새로운 업무 내용 입력
    data.tasks.forEach((task, index) => {
      const row = 8 + index // Row 8부터 시작
      if (row > 15) return // Row 15까지만
      
      updateCellValue(`B${row}`, task.description)
      updateCellValue(`D${row}`, task.completed ? 'O' : '')
      updateCellValue(`E${row}`, task.notes)
    })
    
    // 특이사항 입력
    updateCellValue('B17', data.specialNotes)
    
    // 파일을 Blob으로 변환
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // 파일 다운로드
    const url = window.URL.createObjectURL(blob)
    const filename = `일일업무일지_${data.name}_${data.date}.xlsx`
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // URL 객체 해제
    window.URL.revokeObjectURL(url)

  } catch (error: any) {
    console.error('Excel 파일 생성 중 오류:', error)
    alert('Excel 파일 생성 중 오류가 발생했습니다: ' + error.message)
  }
}