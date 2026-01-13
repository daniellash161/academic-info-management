import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

import { contactMessagesService } from "../../services/contactMessagesService";

type ContactCardProps = {
  title: string;
  lines: string[];
  icon: React.ReactNode;
  iconBg: string;
};

function ContactCard({ title, lines, icon, iconBg }: ContactCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: 4,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
          {lines.map((l, i) => (
            <Typography
              key={i}
              variant="body2"
              sx={{ opacity: 0.85, whiteSpace: "pre-wrap" }}
            >
              {l}
            </Typography>
          ))}
        </Stack>

        <IconButton
          disableRipple
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.2,
            bgcolor: iconBg,
            color: "#fff",
            "&:hover": { bgcolor: iconBg },
          }}
        >
          {icon}
        </IconButton>
      </Stack>
    </Paper>
  );
}

export function UserContactPage() {
  const snackbar = useSnackbar();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+$/.test(email.trim());
  const phoneOk = /^0\d{9}$/.test(phone.trim());

  const canSend =
    fullName.trim().length > 1 &&
    emailOk &&
    phoneOk &&
    subject.trim().length >= 2 &&
    message.trim().length >= 5;

  const contactInfo = useMemo(
    () => ({
      phone: "03-1234567",
      phoneHours: "א׳-ה׳ 08:00-17:00",
      email: "info@college.ac.il",
      emailNote: "מענה תוך 24 שעות",
      addressLine1: "רחוב האקדמיה 123, תל אביב",
      addressLine2: "קומה 2, משרד 201",
      hoursLine1: "א׳-ה׳ 08:00-17:00",
      hoursLine2: "ו׳ 08:00-13:00",
    }),
    []
  );

  async function onSend() {
    if (!canSend || saving) return;

    setSaving(true);
    try {
      await contactMessagesService.create({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      snackbar.show("הפנייה נשלחה בהצלחה");
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשליחה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      {saving && <LinearProgress sx={{ mb: 2 }} />}

      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, textAlign: "center" }}>
          צור קשר
        </Typography>
        <Typography sx={{ textAlign: "center", opacity: 0.8 }}>
          נשמח לעזור ולענות על כל שאלה
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems="stretch"
      >
        <Box sx={{ width: { xs: "100%", md: 360 } }}>
          <Stack spacing={2}>
            <ContactCard
              title="טלפון"
              lines={[contactInfo.phone, contactInfo.phoneHours]}
              icon={<PhoneInTalkOutlinedIcon />}
              iconBg="linear-gradient(135deg, #2563eb, #60a5fa)"
            />

            <ContactCard
              title='דוא"ל'
              lines={[contactInfo.email, contactInfo.emailNote]}
              icon={<MailOutlineIcon />}
              iconBg="linear-gradient(135deg, #7c3aed, #a78bfa)"
            />

            <ContactCard
              title="כתובת"
              lines={[contactInfo.addressLine1, contactInfo.addressLine2]}
              icon={<LocationOnOutlinedIcon />}
              iconBg="linear-gradient(135deg, #16a34a, #4ade80)"
            />

            <ContactCard
              title="שעות פעילות"
              lines={[contactInfo.hoursLine1, contactInfo.hoursLine2]}
              icon={<AccessTimeOutlinedIcon />}
              iconBg="linear-gradient(135deg, #f97316, #fb7185)"
            />
          </Stack>
        </Box>

        <Paper
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 6,
            minHeight: 520,
          }}
        >
          <Stack spacing={2.2}>
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                שלח לנו הודעה
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                מלא את הפרטים ונחזור אליך בהקדם
              </Typography>
            </Stack>

            <Divider />

            <TextField
              label="שם מלא"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              fullWidth
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                fullWidth
                placeholder="05XXXXXXXX"
                error={phone.trim().length > 0 && !phoneOk}
                helperText={
                  phone.trim().length > 0 && !phoneOk
                    ? "טלפון חייב להיות 10 ספרות ולהתחיל ב-0"
                    : " "
                }
              />

              <TextField
                label='דוא"ל'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                error={email.trim().length > 0 && !emailOk}
                helperText={
                  email.trim().length > 0 && !emailOk ? "אימייל לא תקין" : " "
                }
              />
            </Stack>

            <TextField
              label="נושא"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="הודעה"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              fullWidth
              multiline
              minRows={6}
              inputProps={{ maxLength: 500 }}
              helperText={`${message.length}/500`}
            />

            <Button
              variant="contained"
              onClick={() => void onSend()}
              disabled={!canSend || saving}
              endIcon={<SendRoundedIcon />}
              sx={{ mt: 1, height: 46, borderRadius: 2.5, fontWeight: 900 }}
              fullWidth
            >
              שלח הודעה
            </Button>
          </Stack>
        </Paper>
      </Stack>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
