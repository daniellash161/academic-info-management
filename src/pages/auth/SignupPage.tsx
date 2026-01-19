import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { signupAdmin } from "./auth";

type FieldErrors = {
  fullName?: string;
  employeeNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState({
    fullName: false,
    employeeNumber: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};

    if (!fullName.trim()) e.fullName = "שדה חובה";
    else if (fullName.trim().length < 2) e.fullName = "לפחות 2 תווים";

    if (!employeeNumber.trim()) e.employeeNumber = "שדה חובה";
    else if (!/^\d{4,12}$/.test(employeeNumber.trim()))
      e.employeeNumber = "מספר עובד חייב להיות ספרות בלבד (4-12)";

    if (!email.trim()) e.email = "שדה חובה";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "אימייל לא תקין";

    if (!password.trim()) e.password = "שדה חובה";
    else if (password.trim().length < 6) e.password = "לפחות 6 תווים";

    if (!confirmPassword.trim()) e.confirmPassword = "שדה חובה";
    else if (confirmPassword !== password)
      e.confirmPassword = "הסיסמאות לא תואמות";

    return e;
  }

  const liveErrors = useMemo(
    () => validate(),
    [fullName, employeeNumber, email, password, confirmPassword],
  );

  const canSubmit = useMemo(
    () => Object.keys(liveErrors).length === 0,
    [liveErrors],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    setTouched({
      fullName: true,
      employeeNumber: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!canSubmit || saving) return;

    setSaving(true);
    try {
      await signupAdmin(
        fullName.trim(),
        employeeNumber.trim(),
        email.trim(),
        password,
      );
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setFormError(err?.message ?? "שגיאה בהרשמה");
    } finally {
      setSaving(false);
    }
  }

  function showErr<K extends keyof FieldErrors>(key: K) {
    return Boolean((touched as any)[key] && (liveErrors as any)[key]);
  }

  function helper<K extends keyof FieldErrors>(key: K) {
    return (touched as any)[key] && (liveErrors as any)[key]
      ? (liveErrors as any)[key]
      : " ";
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 460, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
          הרשמת מנהל
        </Typography>
        <Typography sx={{ opacity: 0.75, mb: 2 }}>
          מלא/י פרטים כדי ליצור משתמש מנהל חדש
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="שם מלא"
              value={fullName}
              onChange={(ev) => setFullName(ev.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              required
              error={showErr("fullName")}
              helperText={helper("fullName")}
              fullWidth
              disabled={saving}
            />

            <TextField
              label="מספר עובד"
              value={employeeNumber}
              onChange={(ev) => setEmployeeNumber(ev.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, employeeNumber: true }))}
              required
              error={showErr("employeeNumber")}
              helperText={helper("employeeNumber")}
              fullWidth
              disabled={saving}
              inputProps={{ inputMode: "numeric" }}
            />

            <TextField
              label="אימייל"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              required
              error={showErr("email")}
              helperText={helper("email")}
              autoComplete="email"
              fullWidth
              disabled={saving}
            />

            <TextField
              label="סיסמה"
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              required
              error={showErr("password")}
              helperText={helper("password")}
              autoComplete="new-password"
              fullWidth
              disabled={saving}
            />

            <TextField
              label="אימות סיסמה"
              type="password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, confirmPassword: true }))
              }
              required
              error={showErr("confirmPassword")}
              helperText={helper("confirmPassword")}
              autoComplete="new-password"
              fullWidth
              disabled={saving}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit || saving}
            >
              הרשמה
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/login")}
              disabled={saving}
            >
              כבר יש לך משתמש? התחברות
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
