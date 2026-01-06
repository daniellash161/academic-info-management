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
import { useNavigate, useParams } from "react-router-dom";
import type { InterestArea, UserRole } from "../../models/user";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

const INTERESTS: InterestArea[] = ["תואר ראשון במדעי המחשב", "תואר שני במדעי המחשב"];

const ROLES: Exclude<UserRole, "ADMIN">[] = ["CANDIDATE", "STUDENT", "GRADUATE"];

const ROLE_LABEL: Record<Exclude<UserRole, "ADMIN">, string> = {
  CANDIDATE: "מתעניין",
  STUDENT: "סטודנט",
  GRADUATE: "בוגר",
};

type FormState = {
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  role: Exclude<UserRole, "ADMIN"> | "";
  interest: InterestArea | "";
  notes: string;
};

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  const nameOk = /^[A-Za-z\u0590-\u05FF ]+$/.test(values.fullName.trim());
  if (!values.fullName.trim()) errors.fullName = "שדה חובה";
  else if (!nameOk) errors.fullName = "שם יכול להכיל אותיות ורווחים בלבד";

  if (!/^\d{9}$/.test(values.nationalId)) errors.nationalId = "ת״ז חייבת להיות 9 ספרות";
  if (!/^[^\s@]+@[^\s@]+$/.test(values.email)) errors.email = "מייל לא תקין";
  if (!/^0\d{9}$/.test(values.phone)) errors.phone = "טלפון חייב להיות 10 ספרות ולהתחיל ב-0";

  if (!values.role) errors.role = "חובה לבחור סטטוס";

  if (values.interest && !INTERESTS.includes(values.interest)) {
    errors.interest = "תחום עניין לא תקין";
  }

  if (values.notes.length > 300) errors.notes = "עד 300 תווים";

  return errors;
}

export function CandidateFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [notFound, setNotFound] = useState(false);

  const [values, setValues] = useState<FormState>({
    fullName: "",
    nationalId: "",
    email: "",
    phone: "",
    role: "CANDIDATE",
    interest: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const existing = await usersService.getById(id);
        if (!alive) return;

        if (!existing) {
          setNotFound(true);
          return;
        }

        const safeRole: Exclude<UserRole, "ADMIN"> =
          existing.role === "ADMIN" ? "CANDIDATE" : (existing.role as any);

        setValues({
          fullName: existing.fullName,
          nationalId: existing.nationalId,
          email: existing.email,
          phone: existing.phone,
          role: safeRole,
          interest: (existing.interest ?? "") as any,
          notes: existing.notes ?? "",
        });
      } catch (e: any) {
        if (!alive) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת מועמד");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, snackbar]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    if (!canSave) return;

    try {
      if (isEdit && id) {
        await usersService.update(id, {
          fullName: values.fullName.trim(),
          nationalId: values.nationalId,
          email: values.email.trim(),
          phone: values.phone,
          role: values.role as any,
          interest: (values.interest || undefined) as any,
          notes: values.notes.trim() ? values.notes.trim() : undefined,
        });

        navigate("/admin/candidates", { state: { toast: "המועמד עודכן בהצלחה" } });
      } else {
        await usersService.create({
          fullName: values.fullName.trim(),
          nationalId: values.nationalId,
          email: values.email.trim(),
          phone: values.phone,
          role: values.role as any,
          interest: (values.interest || undefined) as any,
          notes: values.notes.trim() ? values.notes.trim() : undefined,
        });

        navigate("/admin/candidates", { state: { toast: "המועמד נשמר בהצלחה" } });
      }
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
    return <Alert severity="error">Candidate not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת מועמד" : "הוספת מועמד"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField
          label="שם מלא"
          required
          value={values.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName ?? " "}
        />

        <TextField
          label='ת"ז'
          required
          value={values.nationalId}
          onChange={(e) => setField("nationalId", e.target.value)}
          error={Boolean(errors.nationalId)}
          helperText={errors.nationalId ?? " "}
        />

        <TextField
          label="דוא״ל"
          required
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email ?? " "}
        />

        <TextField
          label="טלפון"
          required
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          error={Boolean(errors.phone)}
          helperText={errors.phone ?? " "}
        />

        <TextField
          select
          label="סטטוס"
          required
          value={values.role}
          onChange={(e) => setField("role", e.target.value as any)}
          error={Boolean(errors.role)}
          helperText={errors.role ?? " "}
        >
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {ROLE_LABEL[r]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="מסלול התעניינות (רשות)"
          value={values.interest}
          onChange={(e) => setField("interest", e.target.value as any)}
          error={Boolean(errors.interest)}
          helperText={errors.interest ?? " "}
        >
          <MenuItem value="">—</MenuItem>
          {INTERESTS.map((x) => (
            <MenuItem key={x} value={x}>
              {x}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="הערות נוספות (רשות, עד 300 תווים)"
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
          <Button variant="outlined" onClick={() => navigate("/admin/candidates")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}