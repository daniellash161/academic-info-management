import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { RegistrationRequest, RequestStatus } from "../../models/registrationRequest";
import { requestsService } from "../../services/requestsService";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";
import type { User } from "../../models/user";

type FormState = {
  candidateId: string;
  status: RequestStatus | "";
  createdAt: string;
  notes: string;
};

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!values.candidateId) errors.candidateId = "חובה לבחור מועמד";
  if (!values.status) errors.status = "חובה לבחור סטטוס";

  if (!values.createdAt) errors.createdAt = "חובה לבחור תאריך";
  else if (values.createdAt > todayYmd()) errors.createdAt = "תאריך לא יכול להיות בעתיד";

  if (values.notes.length > 300) errors.notes = "עד 300 תווים";

  return errors;
}

export function RequestFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [searchParams] = useSearchParams();
  const prefCandidateId = searchParams.get("candidateId") ?? "";

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const statuses = requestsService.statuses();

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidates, setCandidates] = useState<User[]>([]);

  const [values, setValues] = useState<FormState>({
    candidateId: prefCandidateId,
    status: "בטיוטה",
    createdAt: todayYmd(),
    notes: "",
  });

  useEffect(() => {
    (async () => {
      setCandidatesLoading(true);
      try {
        const list = await usersService.getCandidates();
        setCandidates(list);
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת מועמדים");
      } finally {
        setCandidatesLoading(false);
      }
    })();
  }, [snackbar]);

  useEffect(() => {
    if (!isEdit && prefCandidateId) {
      setValues((prev) => ({ ...prev, candidateId: prefCandidateId }));
    }
  }, [prefCandidateId, isEdit]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const existing = await requestsService.getById(decodeURIComponent(id));
        if (!existing) {
          setNotFound(true);
          return;
        }

        setValues({
          candidateId: existing.candidateId,
          status: existing.status,
          createdAt: existing.createdAt,
          notes: existing.notes ?? "",
        });
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת בקשה");
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

  function goCreateCandidate() {
    const returnTo = isEdit ? `/admin/requests/${id}/edit` : "/admin/requests/new";
    navigate(`/admin/candidates/new?returnTo=${encodeURIComponent(returnTo)}`);
  }

  async function onSave() {
    if (!canSave || saving) return;

    const payload: Omit<RegistrationRequest, "requestNumber"> = {
      candidateId: values.candidateId,
      status: values.status as RequestStatus,
      createdAt: values.createdAt,
      notes: values.notes.trim() ? values.notes.trim() : undefined,
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        await requestsService.update(Number(decodeURIComponent(id)), payload);
        snackbar.show("הבקשה עודכנה בהצלחה");
      } else {
        await requestsService.create(payload);
        snackbar.show("הבקשה נשמרה בהצלחה");
      }

      navigate("/admin/requests");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשמירה");
    } finally {
      setSaving(false);
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
    return <Alert severity="error">Request not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? `עריכת בקשה #${decodeURIComponent(id!)}` : "הוספת בקשת הרשמה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            select
            fullWidth
            label="מועמד"
            required
            value={values.candidateId}
            onChange={(e) => setField("candidateId", e.target.value)}
            error={Boolean(errors.candidateId)}
            helperText={errors.candidateId ?? " "}
            disabled={candidatesLoading}
          >
            <MenuItem value="">— בחרי מועמד —</MenuItem>
            {candidates.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.fullName} ({c.nationalId})
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={goCreateCandidate} sx={{ whiteSpace: "nowrap", mt: "2px" }}>
            יצירת מועמד חדש
          </Button>
        </Stack>

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
          <Button variant="contained" onClick={() => void onSave()} disabled={!canSave || saving || candidatesLoading}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/requests")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}