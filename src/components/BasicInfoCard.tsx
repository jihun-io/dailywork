import {
  Card,
  Text,
  Input,
  Field,
  Checkbox,
  tokens,
} from "@fluentui/react-components";
import {
  Clock20Regular,
  Person20Regular,
  Building20Regular,
  Calendar20Regular,
} from "@fluentui/react-icons";
import { DailyWorkData } from "../types/dailyWork";
import { useStyles } from "./styles/DailyWorkForm.styles";

interface BasicInfoCardProps {
  formData: DailyWorkData;
  onFormDataChange: (updates: Partial<DailyWorkData>) => void;
  onDepartmentClick: () => void;
  onNameClick: () => void;
}

export function BasicInfoCard({
  formData,
  onFormDataChange,
  onDepartmentClick,
  onNameClick,
}: BasicInfoCardProps) {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.cardHeader}>
        <Text className={styles.sectionTitle}>
          <Calendar20Regular />
          기본 정보
        </Text>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.flexContainer}>
          <div className={styles.secondRow}>
            <div className={`${styles.enhancedField} ${styles.equalField}`}>
              <Field label="부서명" required>
                <Input
                  placeholder="클릭하여 설정하세요"
                  value={formData.department}
                  contentBefore={<Building20Regular className="field-icon" />}
                  size="large"
                  readOnly
                  tabIndex={-1}
                  onClick={onDepartmentClick}
                  className={styles.flexibleInput}
                />
              </Field>
            </div>
            <div className={`${styles.enhancedField} ${styles.equalField}`}>
              <Field label="작성자" required>
                <Input
                  placeholder="클릭하여 설정하세요"
                  value={formData.name}
                  contentBefore={<Person20Regular className="field-icon" />}
                  size="large"
                  readOnly
                  tabIndex={-1}
                  onClick={onNameClick}
                  className={styles.flexibleInput}
                />
              </Field>
            </div>
          </div>
          <div className={styles.firstRow}>
            <div className={`${styles.enhancedField} ${styles.dateField}`}>
              <Field label="작성일자" required>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    onFormDataChange({ date: e.target.value })
                  }
                  size="large"
                  contentBefore={<Calendar20Regular className="field-icon" />}
                />
              </Field>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.spacingVerticalM,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: tokens.spacingHorizontalL,
                }}
              >
                <div className={`${styles.enhancedField} ${styles.timeField}`}>
                  <Field label="시작 시간" required>
                    <Input
                      type="time"
                      value={formData.startTime}
                      contentBefore={<Clock20Regular className="field-icon" />}
                      onChange={(e) =>
                        onFormDataChange({ startTime: e.target.value })
                      }
                      size="large"
                    />
                  </Field>
                </div>
                <div className={`${styles.enhancedField} ${styles.timeField}`}>
                  <Field label="종료 시간" required>
                    <Input
                      type="time"
                      value={formData.endTime}
                      contentBefore={<Clock20Regular className="field-icon" />}
                      onChange={(e) =>
                        onFormDataChange({ endTime: e.target.value })
                      }
                      size="large"
                    />
                  </Field>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "end" }}>
                <Checkbox
                  checked={formData.halfDay}
                  onChange={(_, data) =>
                    onFormDataChange({
                      halfDay: !!data.checked,
                      oasis: !!data.checked ? false : formData.oasis,
                    })
                  }
                  label="반차"
                  size="large"
                />
                <Checkbox
                  checked={formData.oasis}
                  onChange={(_, data) =>
                    onFormDataChange({
                      oasis: !!data.checked,
                      halfDay: !!data.checked ? false : formData.halfDay,
                    })
                  }
                  label="오아시스"
                  size="large"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}