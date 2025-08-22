"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Minus, Clock, Save, SaveIcon } from "lucide-react";
import { DailyWorkData, WorkTask } from "../types/dailyWork";
import { generateExcelFile } from "../lib/excelGenerator";
import {
  saveUserInfo,
  loadUserInfo,
  UserInfo,
} from "../lib/autoFill";

export default function DailyWorkForm() {
  const [formData, setFormData] = useState<DailyWorkData>({
    date: new Date().toISOString().split("T")[0],
    name: "",
    department: "",
    workTimeRange: "09:00 ~ 18:00",
    tasks: [
      {
        id: "1",
        description: "",
        completed: false,
        notes: "",
      },
    ],
    specialNotes: "",
  });

  useEffect(() => {
    const userInfo = loadUserInfo();
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name: userInfo.name,
        department: userInfo.department,
        workTimeRange: userInfo.workTimeRange,
      }));
    }
  }, []);

  const addTask = () => {
    const newTask: WorkTask = {
      id: Date.now().toString(),
      description: "",
      completed: false,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const removeTask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateTask = (id: string, updates: Partial<WorkTask>) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  };

  const handleSaveUserInfo = () => {
    const userInfo: UserInfo = {
      name: formData.name,
      department: formData.department,
      workTimeRange: formData.workTimeRange,
    };
    saveUserInfo(userInfo);
    alert("사용자 정보가 저장되었습니다!");
  };

  const handleExportExcel = async () => {
    try {
      await generateExcelFile(formData);
    } catch (error) {
      console.error("엑셀 파일 생성 중 오류:", error);
      alert("엑셀 파일 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl grid grid-cols-1 grid-rows-[auto 1fr] h-dvh overflow-hidden select-none cursor-default">
      <div className="h-fit p-4 flex flex-row justify-between">
        <h1 className="text-3xl font-bold text-left mb-2">dailywork</h1>
        <div className="">
          <Button
            onClick={handleExportExcel}
            size="lg"
            className="w-full md:w-auto"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            엑셀 파일로 저장
          </Button>
        </div>
      </div>
      <div className="overflow-y-scroll p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">작성일자</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="workTimeRange">근무시간</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="workTimeRange"
                    placeholder="09:00 ~ 18:00"
                    value={formData.workTimeRange}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workTimeRange: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="department">부서명</Label>
                <Input
                  id="department"
                  placeholder="부서명을 입력하세요"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="name">작성자</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveUserInfo} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                사용자 정보 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>업무 내용</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                {formData.tasks.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => removeTask(task.id)}
                    className="p-0 ml-auto absolute right-2 top-2 w-6 h-6"
                  >
                    <Minus />
                  </Button>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>업무 내용</Label>
                  </div>
                  <Input
                    placeholder="수행한 업무 내용을 입력하세요"
                    value={task.description}
                    onChange={(e) =>
                      updateTask(task.id, { description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`completed-${task.id}`}
                      checked={task.completed}
                      onChange={(e) =>
                        updateTask(task.id, { completed: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`completed-${task.id}`}
                      className="text-sm font-medium"
                    >
                      업무 완료
                    </Label>
                  </div>
                  <div>
                    <Label>비고 (진행사항 or 이슈사항 등)</Label>
                    <Input
                      placeholder="비고사항을 입력하세요"
                      value={task.notes}
                      onChange={(e) =>
                        updateTask(task.id, { notes: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={addTask} size="sm" className="ml-auto">
                <Plus className="w-4 h-4 mr-2" />
                업무 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>특이사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="specialNotes">
                특이사항 (신규 발생 업무 or 이슈사항 등)
              </Label>
              <textarea
                id="specialNotes"
                className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md bg-background mt-2"
                placeholder="신규 발생 업무, 이슈사항, 특별한 사항 등을 자유롭게 작성하세요"
                value={formData.specialNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialNotes: e.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
