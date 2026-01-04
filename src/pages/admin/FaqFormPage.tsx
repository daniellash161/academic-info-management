import { useEffect, useMemo, useState } from "react";
import { Box, Button, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  question: string;
  answer: string;
  displayOrder: number | "";
  isPublished: boolean;
};

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};

  if (!v.question.trim()) e.question = "שדה חובה";
  else if (v.question.trim().length > 120) e.question = "עד 120 תווים";

  if (!v.answer.trim()) e.answer = "שדה חובה";
  else if (v.answer.trim().length > 800) e.answer = "עד 800 תווים";

  if (v.displayOrder === "") e.displayOrder = "שדה חובה";
  else if (!Number.isInteger(Number(v.displayOrder)) || Number(v.displayOrder) < 1) {
    e.displayOrder = "סדר תצוגה חייב להיות מספר שלם >= 1";
  }

  return e;
}

export function FaqFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [values, setValues] = useState<FormState>({
    question: "",
    answer: "",
    displayOrder: 1,
    isPublished: true,
  });

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const existing = await faqsService.getById(id);
        if (!existing) return;

        setValues({
          question: existing.question,
          answer: existing.answer,
          displayOrder: existing.displayOrder,
          isPublished: existing.isPublished,
        });
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת שאלה");
      }
    })();
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    if (!canSave) return;

    const payload: Omit<Faq, "id" | "createdAt"> = {
      question: values.question.trim(),
      answer: values.answer.trim(),
      displayOrder: Number(values.displayOrder),
      isPublished: values.isPublished,
    };

    try {
      if (isEdit && id) {
        await faqsService.update(id, payload);
        snackbar.show("השאלה עודכנה בהצלחה");
      } else {
        await faqsService.create(payload);
        snackbar.show("השאלה נשמרה בהצלחה");
      }

      navigate("/admin/faqs");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשמירה");
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת שאלה נפוצה" : "הוספת שאלה נפוצה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 700 }}>
        <TextField
          label="שאלה"
          required
          value={values.question}
          onChange={(e) => setField("question", e.target.value)}
          error={Boolean(errors.question)}
          helperText={errors.question ?? " "}
        />

        <TextField
          label="תשובה"
          required
          multiline
          minRows={5}
          value={values.answer}
          onChange={(e) => setField("answer", e.target.value)}
          error={Boolean(errors.answer)}
          helperText={errors.answer ?? " "}
        />

        <TextField
          label="סדר תצוגה"
          required
          type="number"
          value={values.displayOrder}
          onChange={(e) => setField("displayOrder", e.target.value === "" ? "" : Number(e.target.value))}
          error={Boolean(errors.displayOrder)}
          helperText={errors.displayOrder ?? " "}
        />

        <FormControlLabel
          control={<Switch checked={values.isPublished} onChange={(e) => setField("isPublished", e.target.checked)} />}
          label="מפורסם"
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => void onSave()} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/faqs")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}