import { useEffect, useMemo, useState } from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { ContactMessageStatus } from "../../models/contactMessage";
import { contactMessagesService } from "../../services/contactMessagesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  status: ContactMessageStatus | "";
  adminNote: string;
};

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!v.status) e.status = "חובה לבחור סטטוס";
  if (v.adminNote.length > 300) e.adminNote = "עד 300 תווים";
  return e;
}

export function ContactMessageFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [values, setValues] = useState<FormState>({
    status: "חדש",
    adminNote: "",
  });

  useEffect(() => {
    if (!id) return;
    const existing = contactMessagesService.getById(id);
    if (!existing) return;

    setValues({
      status: existing.status,
      adminNote: existing.adminNote ?? "",
    });
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!id || !canSave) return;

    contactMessagesService.update(id, {
      status: values.status as ContactMessageStatus,
      adminNote: values.adminNote,
    });

    snackbar.show("הפנייה עודכנה בהצלחה");

    navigate("/admin/contacts");
  }

  const statuses = contactMessagesService.statuses();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        עריכת פנייה
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField
          select
          required
          label="סטטוס"
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
          label="הערת מנהל (רשות, עד 300 תווים)"
          value={values.adminNote}
          onChange={(e) => setField("adminNote", e.target.value)}
          multiline
          minRows={3}
          error={Boolean(errors.adminNote)}
          helperText={errors.adminNote ?? `${values.adminNote.length}/300`}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/contacts")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}