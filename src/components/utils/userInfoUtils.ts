import { DailyWorkData } from "../../types/dailyWork";
import { saveUserInfo, loadUserInfo, UserInfo } from "../../lib/autoFill";

export const handleRightClick = (e: React.MouseEvent) => {
  if (
    (e.target as HTMLElement).tagName !== "INPUT" &&
    (e.target as HTMLElement).tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
  }
};

export const loadUserInfoToForm = (
  setFormData: React.Dispatch<React.SetStateAction<DailyWorkData>>
) => {
  const userInfo = loadUserInfo();
  if (userInfo) {
    let startTime = "09:00";
    let endTime = "18:00";

    if (userInfo.workTimeRange) {
      const timeMatch = userInfo.workTimeRange.match(
        /(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/
      );
      if (timeMatch) {
        startTime = timeMatch[1];
        endTime = timeMatch[2];
      }
    }

    setFormData((prev) => ({
      ...prev,
      name: userInfo.name,
      department: userInfo.department,
      startTime,
      endTime,
    }));
  }
};

export const saveUserInfoFromForm = (formData: DailyWorkData) => {
  const userInfo: UserInfo = {
    name: formData.name,
    department: formData.department,
    workTimeRange: `${formData.startTime} ~ ${formData.endTime}`,
  };
  saveUserInfo(userInfo);
};

export const focusInputWithDelay = (
  ref: React.RefObject<HTMLInputElement | null>,
  delay = 100
) => {
  setTimeout(() => {
    ref.current?.focus();
  }, delay);
};