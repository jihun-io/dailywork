import { useRef } from "react";
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  tokens,
} from "@fluentui/react-components";
import { Person20Regular, Building20Regular } from "@fluentui/react-icons";
import { DailyWorkData } from "../types/dailyWork";
import { focusInputWithDelay } from "./utils/userInfoUtils";
import { loadUserInfo } from "../lib/autoFill.ts";

interface UserInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DailyWorkData;
  onFormDataChange: (updates: Partial<DailyWorkData>) => void;
  onSave: () => void;
  focusTarget?: "department" | "name";
}

export function UserInfoDialog({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSave,
  focusTarget,
}: UserInfoDialogProps) {
  const departmentInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (open && focusTarget) {
      const ref =
        focusTarget === "department" ? departmentInputRef : nameInputRef;
      focusInputWithDelay(ref);
    } else if (!open) {
      handleSaveWithoutSave(); // 다이얼로그가 닫힐 때 저장하지 않고 닫기
    }
  };

  const handleSaveAndClose = () => {
    onSave();
    onOpenChange(false);
  };

  const handleSaveWithoutSave = () => {
    const userInfo = loadUserInfo();
    if (userInfo) {
      onFormDataChange({
        name: userInfo.name,
        department: userInfo.department,
      });
    } else {
      onFormDataChange({
        name: "",
        department: "",
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_, data) => handleOpenChange(data.open)}
      modalType="alert"
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>사용자 정보 설정</DialogTitle>
          <DialogContent>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.spacingVerticalL,
              }}
            >
              <Field label="부서명" required>
                <Input
                  ref={departmentInputRef}
                  placeholder="부서명을 입력하세요"
                  value={formData.department}
                  contentBefore={<Building20Regular />}
                  onChange={(e) =>
                    onFormDataChange({ department: e.target.value })
                  }
                  size="large"
                />
              </Field>
              <Field label="작성자" required>
                <Input
                  ref={nameInputRef}
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  contentBefore={<Person20Regular />}
                  onChange={(e) => onFormDataChange({ name: e.target.value })}
                  size="large"
                />
              </Field>
            </div>
          </DialogContent>
          <DialogActions style={{ paddingTop: "16px" }}>
            <Button appearance="secondary" onClick={handleSaveWithoutSave}>
              취소
            </Button>
            <Button appearance="primary" onClick={handleSaveAndClose}>
              저장
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
