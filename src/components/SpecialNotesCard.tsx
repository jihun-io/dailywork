import {
  Card,
  Text,
  Field,
  Textarea,
} from "@fluentui/react-components";
import {
  Info20Regular,
} from "@fluentui/react-icons";
import { DailyWorkData } from "../types/dailyWork";
import { useStyles } from "./styles/DailyWorkForm.styles";

interface SpecialNotesCardProps {
  formData: DailyWorkData;
  onFormDataChange: (updates: Partial<DailyWorkData>) => void;
}

export function SpecialNotesCard({
  formData,
  onFormDataChange,
}: SpecialNotesCardProps) {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.cardHeader}>
        <Text className={styles.sectionTitle}>
          <Info20Regular />
          특이사항
        </Text>
      </div>
      <div className={styles.cardContent}>
        <Field>
          <Textarea
            placeholder="신규 발생 업무, 이슈사항, 특별한 사항 등을 작성하세요..."
            value={formData.specialNotes}
            onChange={(e) =>
              onFormDataChange({ specialNotes: e.target.value })
            }
            className={styles.specialNotesField}
            resize="vertical"
          />
        </Field>
      </div>
    </Card>
  );
}