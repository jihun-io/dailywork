const USER_INFO_KEY = 'dailyWork_userInfo'
const COMMON_TASKS_KEY = 'dailyWork_commonTasks'

export interface UserInfo {
  name: string
  department: string
  workTimeRange: string
}

export interface CommonTask {
  id: string
  description: string
  category: string
}

export function saveUserInfo(userInfo: UserInfo) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  }
}

export function loadUserInfo(): UserInfo | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(USER_INFO_KEY)
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export function saveCommonTasks(tasks: CommonTask[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMON_TASKS_KEY, JSON.stringify(tasks))
  }
}

export function loadCommonTasks(): CommonTask[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(COMMON_TASKS_KEY)
    return stored ? JSON.parse(stored) : []
  }
  return []
}

export function getQuickFillSuggestions(): string[] {
  return [
    '개발환경 설정 및 테스트',
    '코드 리뷰 및 품질 검토',
    '기능 개발 및 구현',
    '버그 수정 및 디버깅',
    '문서 작성 및 업데이트',
    '회의 참석 및 논의',
    '시스템 모니터링 및 유지보수',
    '테스트 케이스 작성 및 실행',
    '데이터베이스 최적화',
    'API 설계 및 구현'
  ]
}

export function generateDailyTasks(): string[] {
  const commonTasks = [
    '이메일 확인 및 응답',
    '일일 스탠드업 미팅 참석',
    '진행 중인 프로젝트 상태 확인',
    '코드 커밋 및 푸시',
    '테스트 결과 검토'
  ]
  
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  if (dayOfWeek === 1) {
    commonTasks.push('주간 계획 수립')
  }
  
  if (dayOfWeek === 5) {
    commonTasks.push('주간 업무 정리 및 보고서 작성')
  }
  
  return commonTasks
}