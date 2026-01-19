import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { loginAdmin } from "./auth";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const canSubmit = useMemo(
    () => Object.keys(liveErrors).length === 0,
    [liveErrors],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await loginAdmin(email.trim(), password);
      const to = location?.state?.from ? String(location.state.from) : "/admin";
      navigate(to, { replace: true });
    } catch (err: any) {
      setFormError(err?.message ?? "אימייל או סיסמה שגויים");
    } finally {
      setSaving(false);
    }
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
              disabled={saving}
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
              disabled={saving}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit || saving}
            >
              התחברות
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/user")}
              disabled={saving}
            >
              חזרה לבית
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/signup")}
              disabled={saving}
            >
              אין לך משתמש מנהל? הרשמה
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
