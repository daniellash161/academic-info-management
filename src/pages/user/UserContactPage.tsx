import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function UserContactPage() {
  const snackbar = useSnackbar();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const canSend =
    fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+$/.test(email.trim()) &&
    message.trim().length >= 5;

  async function onSend() {
    if (!canSend || saving) return;

    setSaving(true);
    try {
      snackbar.show("נשלח בהצלחה (חיבור ל-Firestore יתווסף בשלב הבא)");
      setFullName("");
      setEmail("");
      setMessage("");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשליחה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      {saving && <LinearProgress />}

      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        צור קשר
      </Typography>

      <Paper sx={{ p: 2, maxWidth: 560 }}>
        <Stack spacing={2}>
          <TextField
            label="שם מלא"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            label="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="תוכן הפנייה"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            multiline
            minRows={4}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => void onSend()}
              disabled={!canSend || saving}
            >
              שליחה
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
