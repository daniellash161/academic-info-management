import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { ContactMessage, ContactStatus } from "../../models/contactMessage";
import { contactMessagesService } from "../../services/contactMessagesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;

  status: ContactStatus | "";
  adminNotes: string;
};

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};

  const nameOk = /^[A-Za-z\u0590-\u05FF ]+$/.test(v.fullName.trim());
  if (!v.fullName.trim()) e.fullName = "שדה חובה";
  else if (!nameOk) e.fullName = "שם יכול להכיל אותיות ורווחים בלבד";

  if (!/^[^\s@]+@[^\s@]+$/.test(v.email.trim())) e.email = "מייל לא תקין";
  if (!/^0\d{9}$/.test(String(v.phone).trim())) e.phone = "טלפון חייב להיות 10 ספרות ולהתחיל ב-0";

  if (!v.subject.trim()) e.subject = "שדה חובה";
  else if (v.subject.trim().length > 80) e.subject = "עד 80 תווים";

  if (!v.message.trim()) e.message = "שדה חובה";
  else if (v.message.trim().length > 1000) e.message = "עד 1000 תווים";

  if (!v.status) e.status = "שדה חובה";
  if (v.adminNotes.length > 500) e.adminNotes = "עד 500 תווים";

  return e;
}

export function ContactMessageFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const statuses = contactMessagesService.statuses();

  const [values, setValues] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "חדש",
    adminNotes: "",
  });

  useEffect(() => {
    if (!id) return;
    const existing = contactMessagesService.getById(id);
    if (!existing) return;

    setValues({
      fullName: existing.fullName,
      email: existing.email,
      phone: existing.phone,
      subject: existing.subject,
      message: existing.message,
      status: existing.status,
      adminNotes: existing.adminNotes ?? "",
    });
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!id) return;
    if (!canSave) return;

    const payload: Partial<Omit<ContactMessage, "id" | "createdAt">> = {
      status: values.status as ContactStatus,
      adminNotes: values.adminNotes.trim() ? values.adminNotes.trim() : undefined,
    };

    contactMessagesService.update(id, payload);
    snackbar.show("הפנייה עודכנה בהצלחה");
    navigate("/admin/contacts");
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        טיפול בפנייה
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <TextField label="שם" value={values.fullName} disabled />
        <TextField label="מייל" value={values.email} disabled />
        <TextField label="טלפון" value={values.phone} disabled />
        <TextField label="נושא" value={values.subject} disabled />

        <TextField label="הודעה" value={values.message} disabled multiline minRows={5} />

        <TextField
          select
          label="סטטוס"
          required
          value={values.status}
          onChange={(e) => setField("status", e.target.value as any)}
          error={Boolean(errors.status)}
          helperText={errors.status ?? " "}
        >
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="הערות מנהל (רשות, עד 500 תווים)"
          value={values.adminNotes}
          onChange={(e) => setField("adminNotes", e.target.value)}
          multiline
          minRows={3}
          error={Boolean(errors.adminNotes)}
          helperText={errors.adminNotes ?? `${values.adminNotes.length}/500`}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/contacts")}>
            חזרה
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}