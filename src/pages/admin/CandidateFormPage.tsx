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
import type { InterestArea, UserRole } from "../../models/user";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

const INTERESTS: InterestArea[] = ["מדעי המחשב"];

const ROLES: UserRole[] = ["CANDIDATE", "ADMIN", "STUDENT", "GRADUATE"];

type FormState = {
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  role: UserRole | "";
  password: string;
  interest: InterestArea | "";
  notes: string;
};

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  // שם: רק אותיות ורווחים (עברית/אנגלית), בלי ספרות/תווים מיוחדים
  const nameOk = /^[A-Za-z\u0590-\u05FF ]+$/.test(values.fullName.trim());
  if (!values.fullName.trim()) errors.fullName = "שדה חובה";
  else if (!nameOk) errors.fullName = "שם יכול להכיל אותיות ורווחים בלבד";

  // ת"ז בדיוק 9 ספרות
  if (!/^\d{9}$/.test(values.nationalId)) errors.nationalId = "ת״ז חייבת להיות 9 ספרות";

  // מייל: טקסט לפני/אחרי @ (בסיסי)
  if (!/^[^\s@]+@[^\s@]+$/.test(values.email)) errors.email = "מייל לא תקין";

  // טלפון: בדיוק 10 ספרות, מתחיל ב-0
  if (!/^0\d{9}$/.test(values.phone)) errors.phone = "טלפון חייב להיות 10 ספרות ולהתחיל ב-0";

  // role מרשימה סגורה, לא ריק
  if (!values.role) errors.role = "חובה לבחור תפקיד";

  // תחום עניין: אם קיים, חייב להיות מתוך הרשימה
  if (values.interest && !INTERESTS.includes(values.interest)) {
    errors.interest = "תחום עניין לא תקין";
  }

  // סיסמה: חובה למנהל מערכת, מינימום 6
  if (values.role === "ADMIN") {
    if (!values.password) errors.password = "סיסמה חובה למנהל מערכת";
    else if (values.password.length < 6) errors.password = "מינימום 6 תווים";
  } else if (values.password && values.password.length < 6) {
    errors.password = "מינימום 6 תווים";
  }

  return errors;
}

export function CandidateFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const snackbar = useSnackbar();

  const [values, setValues] = useState<FormState>({
    fullName: "",
    nationalId: "",
    email: "",
    phone: "",
    role: "CANDIDATE",
    password: "",
    interest: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    const existing = usersService.getById(id);
    if (!existing) return;

    setValues({
      fullName: existing.fullName,
      nationalId: existing.nationalId,
      email: existing.email,
      phone: existing.phone,
      role: existing.role,
      password: existing.password ?? "",
      interest: (existing.interest ?? "") as any,
      notes: existing.notes ?? "",
    });
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!canSave) return; // אין אפשרות לשמור טופס שגוי (מחוון)
    if (isEdit && id) {
      usersService.update(id, {
        fullName: values.fullName.trim(),
        nationalId: values.nationalId,
        email: values.email.trim(),
        phone: values.phone,
        role: values.role as any,
        password: values.password || undefined,
        interest: (values.interest || undefined) as any,
        notes: values.notes || undefined,
      });
      snackbar.show("המועמד עודכן בהצלחה");
    } else {
      usersService.create({
        fullName: values.fullName.trim(),
        nationalId: values.nationalId,
        email: values.email.trim(),
        phone: values.phone,
        role: values.role as any,
        password: values.password || undefined,
        interest: (values.interest || undefined) as any,
        notes: values.notes || undefined,
      });
      snackbar.show("המועמד נשמר בהצלחה");
    }

    // לפי התכנון: אחרי שמירה חוזרים למסך מועמדים כדי לוודא שהנתונים נשמרו
    navigate("/admin/candidates");
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
          label="Role"
          required
          value={values.role}
          onChange={(e) => setField("role", e.target.value as any)}
          error={Boolean(errors.role)}
          helperText={errors.role ?? " "}
        >
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="סיסמה (למנהל מערכת)"
          type="password"
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          error={Boolean(errors.password)}
          helperText={errors.password ?? " "}
        />

        <TextField
          select
          label="תחום עניין (רשות)"
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
          label="הערות נוספות (רשות)"
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
          multiline
          minRows={3}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
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