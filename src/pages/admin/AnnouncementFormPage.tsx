import { useEffect, useMemo, useState } from "react";
import { Box, Button, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { Announcement } from "../../models/announcement";
import { announcementsService } from "../../services/announcementsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  title: string;
  content: string;
  publishedAt: string;
  isActive: boolean;
};

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};

  if (!v.title.trim()) e.title = "שדה חובה";
  else if (v.title.trim().length > 60) e.title = "עד 60 תווים";

  if (!v.content.trim()) e.content = "שדה חובה";
  else if (v.content.trim().length > 500) e.content = "עד 500 תווים";

  if (!v.publishedAt) e.publishedAt = "שדה חובה";
  else if (v.publishedAt > todayYmd()) e.publishedAt = "תאריך לא יכול להיות בעתיד";

  return e;
}

export function AnnouncementFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [values, setValues] = useState<FormState>({
    title: "",
    content: "",
    publishedAt: todayYmd(),
    isActive: true,
  });

  useEffect(() => {
    if (!id) return;
    const existing = announcementsService.getById(id);
    if (!existing) return;

    setValues({
      title: existing.title,
      content: existing.content,
      publishedAt: existing.publishedAt,
      isActive: existing.isActive,
    });
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!canSave) return;

    const payload: Omit<Announcement, "id"> = {
      title: values.title.trim(),
      content: values.content.trim(),
      publishedAt: values.publishedAt,
      isActive: values.isActive,
    };

    try {
      if (isEdit && id) {
        announcementsService.update(id, payload);
        snackbar.show("העדכון עודכן בהצלחה");
      } else {
        announcementsService.create(payload);
        snackbar.show("העדכון נשמר בהצלחה");
      }

      navigate("/admin/announcements");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשמירה");
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת עדכון" : "הוספת עדכון חדש"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 640 }}>
        <TextField
          label="כותרת"
          required
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? " "}
        />

        <TextField
          label="תוכן העדכון"
          required
          multiline
          minRows={4}
          value={values.content}
          onChange={(e) => setField("content", e.target.value)}
          error={Boolean(errors.content)}
          helperText={errors.content ?? `${values.content.length}/500`}
        />

        <TextField
          label="תאריך פרסום"
          required
          type="date"
          value={values.publishedAt}
          onChange={(e) => setField("publishedAt", e.target.value)}
          error={Boolean(errors.publishedAt)}
          helperText={errors.publishedAt ?? " "}
          InputLabelProps={{ shrink: true }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={values.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
            />
          }
          label="עדכון פעיל"
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/announcements")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}