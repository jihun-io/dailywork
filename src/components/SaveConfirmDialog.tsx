import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Button,
} from "@fluentui/react-components";
import { Save24Regular, Warning24Regular } from "@fluentui/react-icons";

interface SaveConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onCloseWithoutSaving: () => void;
  onCancel: () => void;
}

export function SaveConfirmDialog({
  isOpen,
  onOpenChange,
  onSave,
  onCloseWithoutSaving,
  onCancel,
}: SaveConfirmDialogProps) {
  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const handleCloseWithoutSaving = () => {
    onCloseWithoutSaving();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_event, data) => onOpenChange(data.open)}
    >
      <DialogSurface style={{ width: "480px" }}>
        <DialogTitle
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <Warning24Regular style={{ color: "#f59e0b" }} />
          변경 사항 저장
        </DialogTitle>
        <DialogBody>
          <p>
            저장하지 않은 변경 사항이 있습니다.
            <br />
            저장하시겠습니까?
          </p>
        </DialogBody>
        <DialogActions
          style={{
            width: "100%",
            paddingTop: "16px",
            justifyContent: "flex-end",
          }}
        >
          <Button
            appearance="secondary"
            onClick={handleCancel}
            style={{ marginRight: "auto" }}
          >
            취소
          </Button>
          <Button appearance="secondary" onClick={handleCloseWithoutSaving}>
            저장하지 않고 닫기
          </Button>
          <Button
            appearance="primary"
            icon={<Save24Regular />}
            onClick={handleSave}
          >
            저장
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
