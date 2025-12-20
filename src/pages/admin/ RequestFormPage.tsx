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
import type { RegistrationRequest, RequestStatus } from "../../models/registrationRequest";
import { requestsService } from "../../services/requestsService";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  candidateId: string;
  status: RequestStatus | "";
  createdAt: string; // YYYY-MM-DD
  notes: string;
};

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!values.candidateId) errors.candidateId = "חובה לבחור מועמד";
  else {
    const c = usersService.getById(values.candidateId);
    if (!c || c.role !== "CANDIDATE") errors.candidateId = "המועמד שנבחר לא קיים";
  }

  if (!values.status) errors.status = "חובה לבחור סטטוס";

  if (!values.createdAt) errors.createdAt = "חובה לבחור תאריך";
  else if (values.createdAt > todayYmd()) errors.createdAt = "תאריך לא יכול להיות בעתיד";

  if (values.notes.length > 300) errors.notes = "עד 300 תווים";

  return errors;
}

export function RequestFormPage() {
  const { requestNumber } = useParams();
  const isEdit = Boolean(requestNumber);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const candidates = usersService.getCandidates();
  const statuses = requestsService.statuses();

  const [values, setValues] = useState<FormState>({
    candidateId: "",
    status: "בטיוטה",
    createdAt: todayYmd(),
    notes: "",
  });

  useEffect(() => {
    if (!requestNumber) return;
    const num = Number(requestNumber);
    const existing = requestsService.getByNumber(num);
    if (!existing) return;

    setValues({
      candidateId: existing.candidateId,
      status: existing.status,
      createdAt: existing.createdAt,
      notes: existing.notes ?? "",
    });
  }, [requestNumber]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!canSave) return;

    const payload: Omit<RegistrationRequest, "requestNumber"> = {
      candidateId: values.candidateId,
      status: values.status as RequestStatus,
      createdAt: values.createdAt,
      notes: values.notes.trim() ? values.notes.trim() : undefined,
    };

    if (isEdit) {
      requestsService.update(Number(requestNumber), payload);
      snackbar.show("הבקשה עודכנה בהצלחה");
    } else {
      requestsService.create(payload);
      snackbar.show("הבקשה נשמרה בהצלחה");
    }

    navigate("/admin/requests");
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? `עריכת בקשה #${requestNumber}` : "הוספת בקשת הרשמה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField
          select
          label="מועמד"
          required
          value={values.candidateId}
          onChange={(e) => setField("candidateId", e.target.value)}
          error={Boolean(errors.candidateId)}
          helperText={errors.candidateId ?? " "}
        >
          <MenuItem value="">— בחרי מועמד —</MenuItem>
          {candidates.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.fullName} ({c.nationalId})
            </MenuItem>
          ))}
        </TextField>

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
          label="תאריך יצירה"
          type="date"
          required
          value={values.createdAt}
          onChange={(e) => setField("createdAt", e.target.value)}
          error={Boolean(errors.createdAt)}
          helperText={errors.createdAt ?? " "}
          InputLabelProps={{ shrink: true }}
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
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/requests")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}