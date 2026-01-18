import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const AUTH_KEY = "csih_auth";

type FieldErrors = {
  email?: string;
  password?: string;
};

type AuthSession = {
  role: "admin";
  email: string;
  loginAt: string;
};

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.role === "admin" &&
      typeof parsed.email === "string" &&
      typeof parsed.loginAt === "string"
    ) {
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const s = readSession();
    if (s) navigate(from, { replace: true });
  }, [from, navigate]);

  function validate(nextEmail: string, nextPassword: string): FieldErrors {
    const e: FieldErrors = {};

    if (!nextEmail.trim()) e.email = "שדה חובה";
    else if (!/^\S+@\S+\.\S+$/.test(nextEmail.trim()))
      e.email = "אימייל לא תקין";

    if (!nextPassword.trim()) e.password = "שדה חובה";
    else if (nextPassword.trim().length < 6)
      e.password = "סיסמה חייבת להיות לפחות 6 תווים";

    return e;
  }

  const liveErrors = useMemo(
    () => validate(email, password),
    [email, password],
  );

  const canSubmit = useMemo(() => {
    return Object.keys(liveErrors).length === 0;
  }, [liveErrors]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(nextErrors).length > 0) return;

    const adminEmail = "admin@csih.com";
    const adminPassword = "admin123";

    if (
      email.trim().toLowerCase() !== adminEmail ||
      password !== adminPassword
    ) {
      setFormError("אימייל או סיסמה שגויים");
      return;
    }

    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        role: "admin",
        email: adminEmail,
        loginAt: new Date().toISOString(),
      }),
    );

    navigate(from, { replace: true });
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
      <Paper sx={{ width: "100%", maxWidth: 420, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
          התחברות מנהל
        </Typography>
        <Typography sx={{ opacity: 0.75, mb: 2 }}>
          הזן/י אימייל וסיסמה כדי להיכנס למערכת הניהול
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="אימייל"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              required
              error={Boolean(
                (touched.email || errors.email) && liveErrors.email,
              )}
              helperText={
                (touched.email || errors.email) && liveErrors.email
                  ? liveErrors.email
                  : " "
              }
              autoComplete="email"
              fullWidth
            />

            <TextField
              label="סיסמה"
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              required
              error={Boolean(
                (touched.password || errors.password) && liveErrors.password,
              )}
              helperText={
                (touched.password || errors.password) && liveErrors.password
                  ? liveErrors.password
                  : " "
              }
              autoComplete="current-password"
              fullWidth
            />

            <Button type="submit" variant="contained" disabled={!canSubmit}>
              התחברות
            </Button>

            <Button variant="outlined" onClick={() => navigate("/user")}>
              חזרה לבית
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 2, opacity: 0.6, fontSize: 12 }}>
          פרטי דמו (לבדיקה): admin@csih.com / admin123
        </Box>
      </Paper>
    </Box>
  );
}
