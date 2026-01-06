import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { RegistrationDeadline } from "../../models/registrationDeadline";
import { registrationDeadlinesService } from "../../services/registrationDeadlinesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes: string;
};

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function isYmd(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};

  const title = v.title.trim();
  if (!title) e.title = "שדה חובה";
  else if (title.length > 60) e.title = "עד 60 תווים";

  if (!v.startDate) e.startDate = "שדה חובה";
  else if (!isYmd(v.startDate)) e.startDate = "תאריך לא תקין";

  if (!v.endDate) e.endDate = "שדה חובה";
  else if (!isYmd(v.endDate)) e.endDate = "תאריך לא תקין";

  if (v.startDate && v.endDate && v.startDate > v.endDate) {
    e.endDate = "תאריך סיום חייב להיות אחרי/שווה לתאריך התחלה";
  }

  if (v.notes.length > 300) e.notes = "עד 300 תווים";

  return e;
}

export function RegistrationDeadlineFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [notFound, setNotFound] = useState(false);

  const [values, setValues] = useState<FormState>({
    title: "",
    startDate: todayYmd(),
    endDate: todayYmd(),
    isActive: true,
    notes: "",
  });

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const existing = await registrationDeadlinesService.getById(id);
        if (!existing) {
          setNotFound(true);
          return;
        }

        setValues({
          title: existing.title,
          startDate: existing.startDate,
          endDate: existing.endDate,
          isActive: existing.isActive,
          notes: existing.notes ?? "",
        });
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת מועד הרשמה");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, snackbar]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    if (!canSave) return;

    const payload: Omit<RegistrationDeadline, "id" | "createdAt"> = {
      title: values.title.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      isActive: values.isActive,
      notes: values.notes.trim() ? values.notes.trim() : undefined,
    };

    try {
      if (isEdit && id) {
        await registrationDeadlinesService.update(id, payload);
        snackbar.show("מועד ההרשמה עודכן בהצלחה");
      } else {
        await registrationDeadlinesService.create(payload);
        snackbar.show("מועד ההרשמה נשמר בהצלחה");
      }

      navigate("/admin/deadlines");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשמירה");
    }
  }

  if (loading) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  if (notFound) {
    return <Alert severity="error">Registration deadline not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת מועד הרשמה" : "הוספת מועד הרשמה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <TextField
          label="כותרת"
          required
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? " "}
        />

        <TextField
          label="מתאריך"
          type="date"
          required
          value={values.startDate}
          onChange={(e) => setField("startDate", e.target.value)}
          error={Boolean(errors.startDate)}
          helperText={errors.startDate ?? " "}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="עד תאריך"
          type="date"
          required
          value={values.endDate}
          onChange={(e) => setField("endDate", e.target.value)}
          error={Boolean(errors.endDate)}
          helperText={errors.endDate ?? " "}
          InputLabelProps={{ shrink: true }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={values.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
            />
          }
          label="מועד פעיל"
        />

        <TextField
          label="הערות (רשות, עד 300 תווים)"
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
          multiline
          minRows={3}
          error={Boolean(errors.notes)}
          helperText={errors.notes ?? `${values.notes.length}/300`}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => void onSave()} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/deadlines")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}