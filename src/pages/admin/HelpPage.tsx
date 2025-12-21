import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Faq } from "../../models/faq";
import type { ContactStatus } from "../../models/contactMessage";
import { faqsService } from "../../services/faqsService";
import { contactMessagesService } from "../../services/contactMessagesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

function getRoleFromAuth(): "ADMIN" | "OTHER" {
  const raw = localStorage.getItem("csih_auth");
  if (!raw) return "OTHER";
  if (raw === "ADMIN") return "ADMIN";

  try {
    const obj = JSON.parse(raw);
    const role = String(obj?.role ?? "").toUpperCase();
    return role === "ADMIN" ? "ADMIN" : "OTHER";
  } catch {
    return "OTHER";
  }
}

type ContactFormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function validateContact(v: ContactFormState) {
  const e: Partial<Record<keyof ContactFormState, string>> = {};

  const nameOk = /^[A-Za-z\u0590-\u05FF ]+$/.test(v.fullName.trim());
  if (!v.fullName.trim()) e.fullName = "שדה חובה";
  else if (!nameOk) e.fullName = "שם יכול להכיל אותיות ורווחים בלבד";

  if (!/^[^\s@]+@[^\s@]+$/.test(v.email.trim())) e.email = "מייל לא תקין";
  if (!/^0\d{9}$/.test(String(v.phone).trim())) e.phone = "טלפון חייב להיות 10 ספרות ולהתחיל ב-0";

  if (!v.subject.trim()) e.subject = "שדה חובה";
  else if (v.subject.trim().length > 80) e.subject = "עד 80 תווים";

  if (!v.message.trim()) e.message = "שדה חובה";
  else if (v.message.trim().length > 1000) e.message = "עד 1000 תווים";

  return e;
}

export function HelpPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const role = getRoleFromAuth();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqQuery, setFaqQuery] = useState("");

  const [contactValues, setContactValues] = useState<ContactFormState>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function loadFaqs() {
    setFaqs(role === "ADMIN" ? faqsService.getAll() : faqsService.getPublished());
  }

  useEffect(() => {
    loadFaqs();
  }, [role]);

  const filteredFaqs = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => {
      const hay = [f.question, f.answer].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [faqs, faqQuery]);

  const contactErrors = useMemo(() => validateContact(contactValues), [contactValues]);
  const canSend = Object.keys(contactErrors).length === 0;

  function setContactField<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setContactValues((prev) => ({ ...prev, [key]: value }));
  }

  function sendContact() {
    if (!canSend) return;

    contactMessagesService.create({
      fullName: contactValues.fullName.trim(),
      email: contactValues.email.trim(),
      phone: String(contactValues.phone).trim(),
      subject: contactValues.subject.trim(),
      message: contactValues.message.trim(),
      status: "חדש" as ContactStatus,
    });

    snackbar.show("הפנייה נשלחה בהצלחה");
    setContactValues({ fullName: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        עזרה
      </Typography>

      {role === "ADMIN" && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => navigate("/admin/faqs")}>
            ניהול שאלות נפוצות
          </Button>
          <Button variant="contained" onClick={() => navigate("/admin/contacts")}>
            ניהול פניות
          </Button>
        </Stack>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          שאלות נפוצות
        </Typography>

        <Box sx={{ mb: 2, maxWidth: 520 }}>
          <TextField
            fullWidth
            label="חיפוש בשאלות נפוצות"
            value={faqQuery}
            onChange={(e) => setFaqQuery(e.target.value)}
          />
        </Box>

        {filteredFaqs.length === 0 ? (
          <Typography>אין שאלות להצגה.</Typography>
        ) : (
          <Stack spacing={2}>
            {filteredFaqs.map((f) => (
              <Box key={f.id}>
                <Typography sx={{ fontWeight: 800 }}>{f.question}</Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{f.answer}</Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          צור קשר
        </Typography>

        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <TextField
            label="שם מלא"
            required
            value={contactValues.fullName}
            onChange={(e) => setContactField("fullName", e.target.value)}
            error={Boolean(contactErrors.fullName)}
            helperText={contactErrors.fullName ?? " "}
          />

          <TextField
            label="מייל"
            required
            value={contactValues.email}
            onChange={(e) => setContactField("email", e.target.value)}
            error={Boolean(contactErrors.email)}
            helperText={contactErrors.email ?? " "}
          />

          <TextField
            label="טלפון"
            required
            value={contactValues.phone}
            onChange={(e) => setContactField("phone", e.target.value)}
            error={Boolean(contactErrors.phone)}
            helperText={contactErrors.phone ?? " "}
          />

          <TextField
            select
            label="נושא"
            required
            value={contactValues.subject}
            onChange={(e) => setContactField("subject", e.target.value)}
            error={Boolean(contactErrors.subject)}
            helperText={contactErrors.subject ?? " "}
          >
            <MenuItem value="">— בחרי נושא —</MenuItem>
            <MenuItem value="שאלה כללית">שאלה כללית</MenuItem>
            <MenuItem value="בעיה טכנית">בעיה טכנית</MenuItem>
            <MenuItem value="בקשה לעדכון נתונים">בקשה לעדכון נתונים</MenuItem>
            <MenuItem value="אחר">אחר</MenuItem>
          </TextField>

          <TextField
            label="הודעה"
            required
            multiline
            minRows={4}
            value={contactValues.message}
            onChange={(e) => setContactField("message", e.target.value)}
            error={Boolean(contactErrors.message)}
            helperText={contactErrors.message ?? " "}
          />

          <Button variant="contained" onClick={sendContact} disabled={!canSend}>
            שליחה
          </Button>
        </Stack>
      </Paper>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}