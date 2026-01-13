import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { useNavigate } from "react-router-dom";

import type { UserRole } from "../../models/user";
import type { RegistrationRequest } from "../../models/registrationRequest";
import { usersService } from "../../services/usersService";
import { requestsService } from "../../services/requestsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  requestType: "הרשמה לתוכנית" | "מידע נוסף" | "שיחה עם יועץ";
  createdAt: string;
  notes: string;
};

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function validate(v: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  const nameOk = /^[A-Za-z\u0590-\u05FF ]+$/.test(v.fullName.trim());
  if (!v.fullName.trim()) errors.fullName = "שדה חובה";
  else if (!nameOk) errors.fullName = "שם יכול להכיל אותיות ורווחים בלבד";

  if (!/^[^\s@]+@[^\s@]+$/.test(v.email.trim())) errors.email = "מייל לא תקין";
  if (!/^0\d{9}$/.test(v.phone))
    errors.phone = "טלפון חייב להיות 10 ספרות ולהתחיל ב-0";
  if (!/^\d{9}$/.test(v.nationalId))
    errors.nationalId = "ת״ז חייבת להיות 9 ספרות";

  if (!v.createdAt) errors.createdAt = "שדה חובה";
  if (!v.requestType) errors.requestType = "שדה חובה";
  if (v.notes.length > 500) errors.notes = "עד 500 תווים";

  return errors;
}

export function UserRequestPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    requestType: "הרשמה לתוכנית",
    createdAt: isoToday(),
    notes: "",
  });

  const errors = useMemo(() => validate(values), [values]);
  const canSubmit = Object.keys(errors).length === 0 && !saving;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function ensureCandidateId(): Promise<string> {
    const candidates = await usersService.getCandidates();
    const email = values.email.trim().toLowerCase();
    const nid = values.nationalId.trim();

    const existing = candidates.find(
      (c) =>
        c.email.trim().toLowerCase() === email || c.nationalId.trim() === nid
    );

    if (existing) return existing.id;

    const created = await usersService.create({
      fullName: values.fullName.trim(),
      nationalId: values.nationalId.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role: "CANDIDATE" as Exclude<UserRole, "ADMIN">,
      notes: values.notes.trim() ? values.notes.trim() : undefined,
    });

    return created.id;
  }

  async function onSubmit() {
    if (!canSubmit) return;

    setSaving(true);
    try {
      const candidateId = await ensureCandidateId();

      await requestsService.create({
        candidateId,
        status: "נשלחה" as RegistrationRequest["status"],
        createdAt: values.createdAt,
        note: values.notes.trim() ? values.notes.trim() : undefined,
        type: values.requestType,
      } as any);

      snackbar.show("הבקשה נשלחה בהצלחה");
      navigate("/user", { replace: true });
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשליחת בקשה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ pb: 5 }}>
      {saving && <LinearProgress sx={{ mb: 2 }} />}

      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 8,
          mb: 2.5,
          background:
            "linear-gradient(90deg, rgba(132, 43, 187, 0.95) 0%, rgba(82, 97, 214, 0.92) 100%)",
          color: "common.white",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.18)",
            }}
          >
            <AssignmentOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              הגשת בקשת הרשמה
            </Typography>
            <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
              מלאו את הפרטים הבאים כדי להגיש בקשה לתוכנית הלימודים
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 1.6,
          borderRadius: 5,
          mb: 2.5,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
          <InfoOutlinedIcon />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, mb: 0.25 }}>שימו לב</Typography>
            <Typography sx={{ opacity: 0.85, lineHeight: 1.7 }}>
              לאחר שליחת הבקשה, ניצור איתכם קשר תוך 3–5 ימי עסקים. ניתן לעקוב
              בעמוד “מועדי הרשמה” ו”דרישות קבלה”.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2.2, md: 3 },
          borderRadius: 7,
          mb: 2.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.2 }}>
          טופס הגשת בקשה
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2.2}>
          <Box>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              פרטים אישיים
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 760 }}>
              <TextField
                label="שם מלא"
                required
                value={values.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName ?? " "}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label='ת"ז'
                  required
                  value={values.nationalId}
                  onChange={(e) => setField("nationalId", e.target.value)}
                  error={Boolean(errors.nationalId)}
                  helperText={errors.nationalId ?? " "}
                  fullWidth
                />

                <TextField
                  label="טלפון"
                  required
                  value={values.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone ?? " "}
                  fullWidth
                />
              </Stack>

              <TextField
                label="דוא״ל"
                required
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email ?? " "}
                fullWidth
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>פרטי בקשה</Typography>

            <Stack spacing={2} sx={{ maxWidth: 760 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  select
                  label="סוג בקשה"
                  required
                  value={values.requestType}
                  onChange={(e) =>
                    setField("requestType", e.target.value as any)
                  }
                  error={Boolean(errors.requestType)}
                  helperText={errors.requestType ?? " "}
                  fullWidth
                >
                  <MenuItem value="הרשמה לתוכנית">הרשמה לתוכנית</MenuItem>
                  <MenuItem value="שיחה עם יועץ">שיחה עם יועץ</MenuItem>
                </TextField>

                <TextField
                  label="תאריך"
                  type="date"
                  required
                  value={values.createdAt}
                  onChange={(e) => setField("createdAt", e.target.value)}
                  error={Boolean(errors.createdAt)}
                  helperText={errors.createdAt ?? " "}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>

              <TextField
                label="הערות נוספות (רשות)"
                value={values.notes}
                onChange={(e) => setField("notes", e.target.value)}
                multiline
                minRows={4}
                error={Boolean(errors.notes)}
                helperText={errors.notes ?? `${values.notes.length}/500`}
                fullWidth
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              onClick={() => void onSubmit()}
              disabled={!canSubmit}
              sx={{
                fontWeight: 900,
                borderRadius: 3,
                minWidth: 180,
              }}
            >
              שלח בקשה
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/user")}
              disabled={saving}
              sx={{ borderRadius: 3, minWidth: 140 }}
            >
              ביטול
            </Button>
          </Stack>

          {Object.keys(errors).length > 0 && !saving && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              יש לתקן את השדות המסומנים לפני שליחה.
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 7,
          background:
            "linear-gradient(90deg, rgba(132, 43, 187, 0.95) 0%, rgba(82, 97, 214, 0.92) 100%)",
          color: "common.white",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <HelpOutlineOutlinedIcon />
            <Box>
              <Typography sx={{ fontWeight: 900, mb: 0.4 }}>
                זקוקים לעזרה?
              </Typography>
              <Typography sx={{ opacity: 0.92 }}>
                יש שאלה על התהליך? אפשר לעבור לעמוד עזרה או ליצור קשר.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.2}>
            <Button
              variant="contained"
              onClick={() => navigate("/user/help")}
              sx={{
                fontWeight: 900,
                bgcolor: "rgba(255,255,255,0.92)",
                color: "rgba(35,35,35,1)",
                borderRadius: 3,
                "&:hover": { bgcolor: "rgba(255,255,255,0.85)" },
              }}
            >
              עמוד עזרה
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/user/contact")}
              sx={{
                fontWeight: 900,
                borderColor: "rgba(255,255,255,0.55)",
                color: "common.white",
                borderRadius: 3,
                "&:hover": { borderColor: "rgba(255,255,255,0.85)" },
              }}
            >
              צור קשר
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
