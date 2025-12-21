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
import type { ApplicationDocument, DocumentStatus, DocumentType } from "../../models/applicationDocument";
import { documentsService } from "../../services/documentsService";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  candidateId: string;
  docType: DocumentType | "";
  title: string;
  status: DocumentStatus | "";
  uploadedAt: string; // YYYY-MM-DD or ""
  notes: string;
};

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};

  if (!v.candidateId) e.candidateId = "שדה חובה";
  else {
    const cand = usersService.getById(v.candidateId);
    if (!cand || cand.role !== "CANDIDATE") e.candidateId = "המועמד לא קיים";
  }

  if (!v.docType) e.docType = "שדה חובה";

  if (!v.title.trim()) e.title = "שדה חובה";
  else if (v.title.trim().length > 50) e.title = "עד 50 תווים";

  if (!v.status) e.status = "שדה חובה";

  if (v.notes.length > 300) e.notes = "עד 300 תווים";

  const needsDate = v.status === "הועלה" || v.status === "אושר" || v.status === "נדחה";
  if (needsDate) {
    if (!v.uploadedAt) e.uploadedAt = "חובה להזין תאריך העלאה";
    else if (v.uploadedAt > todayYmd()) e.uploadedAt = "תאריך לא יכול להיות בעתיד";
  } else {
    if (v.uploadedAt && v.uploadedAt > todayYmd()) e.uploadedAt = "תאריך לא יכול להיות בעתיד";
  }

  return e;
}

export function DocumentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const candidates = usersService.getCandidates();
  const types = documentsService.types();
  const statuses = documentsService.statuses();

  const [values, setValues] = useState<FormState>({
    candidateId: "",
    docType: "",
    title: "",
    status: "חסר",
    uploadedAt: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    const existing = documentsService.getById(id);
    if (!existing) return;

    setValues({
      candidateId: existing.candidateId,
      docType: existing.docType,
      title: existing.title,
      status: existing.status,
      uploadedAt: existing.uploadedAt ?? "",
      notes: existing.notes ?? "",
    });
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!canSave) return;

    const payload: Omit<ApplicationDocument, "id"> = {
      candidateId: values.candidateId,
      docType: values.docType as DocumentType,
      title: values.title.trim(),
      status: values.status as DocumentStatus,
      uploadedAt: values.uploadedAt ? values.uploadedAt : undefined,
      notes: values.notes.trim() ? values.notes.trim() : undefined,
    };

    if (payload.status === "חסר") payload.uploadedAt = undefined;

    if (isEdit && id) {
      documentsService.update(id, payload);
      snackbar.show("המסמך עודכן בהצלחה");
    } else {
      documentsService.create(payload);
      snackbar.show("המסמך נשמר בהצלחה");
    }

    navigate("/admin/documents");
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת מסמך" : "הוספת מסמך הרשמה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 620 }}>
        <TextField
          select
          required
          label="מועמד"
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
          required
          label="סוג מסמך"
          value={values.docType}
          onChange={(e) => setField("docType", e.target.value as any)}
          error={Boolean(errors.docType)}
          helperText={errors.docType ?? " "}
        >
          <MenuItem value="">— בחרי סוג —</MenuItem>
          {types.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          label="כותרת"
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? " "}
        />

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
          label="תאריך העלאה"
          type="date"
          value={values.uploadedAt}
          onChange={(e) => setField("uploadedAt", e.target.value)}
          error={Boolean(errors.uploadedAt)}
          helperText={errors.uploadedAt ?? " "}
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
          <Button variant="outlined" onClick={() => navigate("/admin/documents")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}