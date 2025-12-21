import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate, useParams } from "react-router-dom";
import type { ContactMessage, ContactMessageStatus } from "../../models/contactMessage";
import { contactMessagesService } from "../../services/contactMessagesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  status: ContactMessageStatus | "";
  adminNote: string;
};

function validate(v: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!v.status) e.status = "חובה לבחור סטטוס";
  if (v.adminNote.length > 300) e.adminNote = "עד 300 תווים";
  return e;
}

function ymd(iso: string) {
  return (iso ?? "").slice(0, 10);
}

export function ContactMessageFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [message, setMessage] = useState<ContactMessage | null>(null);

  const [values, setValues] = useState<FormState>({
    status: "חדש",
    adminNote: "",
  });

  useEffect(() => {
    if (!id) return;

    const existing = contactMessagesService.getById(id);
    if (!existing) {
      setMessage(null);
      return;
    }

    setMessage(existing);
    setValues({
      status: existing.status,
      adminNote: existing.adminNote ?? "",
    });
  }, [id]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      snackbar.show("הועתק ללוח");
    } catch {
      snackbar.show("לא ניתן להעתיק (בדקי הרשאות דפדפן)");
    }
  }

  function onSave() {
    if (!id || !canSave) return;

    contactMessagesService.update(id, {
      status: values.status as ContactMessageStatus,
      adminNote: values.adminNote,
    });

    snackbar.show("הפנייה עודכנה בהצלחה");
    navigate("/admin/contacts");
  }

  const statuses = contactMessagesService.statuses();

  if (!id) {
    return <Box sx={{ p: 2 }}>חסר מזהה פנייה</Box>;
  }

  if (!message) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">פנייה לא נמצאה</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/admin/contacts")}>
          חזרה לרשימה
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        עריכת פנייה
      </Typography>

      {/* פרטי פנייה + פעולות */}
      <Stack spacing={2} sx={{ maxWidth: 900 }}>
        <Typography variant="h6">פרטי פנייה</Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="שם" value={message.fullName} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="מייל" value={message.email} fullWidth InputProps={{ readOnly: true }} />
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="טלפון" value={message.phone} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="תאריך" value={ymd(message.createdAt)} fullWidth InputProps={{ readOnly: true }} />
        </Stack>

        <TextField label="נושא" value={message.subject} fullWidth InputProps={{ readOnly: true }} />

        <TextField
          label="הודעה"
          value={message.message}
          fullWidth
          multiline
          minRows={4}
          InputProps={{ readOnly: true }}
        />

        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: "wrap",
            gap: 2,
            rowGap: 1.5,
            justifyContent: "flex-start",
            "& .MuiButton-endIcon": { m: 0 }, 
            "& .MuiButton-startIcon": { m: 0 },
          }}
        >
          <Button
            variant="outlined"
            endIcon={<MailOutlineIcon />}
            sx={{ gap: 1, whiteSpace: "nowrap", px: 2.5 }}
            onClick={() => window.open(`mailto:${message.email}`)}
          >
            שליחת מייל
          </Button>

          <Button
            variant="outlined"
            endIcon={<PhoneIcon />}
            sx={{ gap: 1, whiteSpace: "nowrap", px: 2.5 }}
            onClick={() => window.open(`tel:${message.phone}`)}
          >
            חיוג
          </Button>

          <Button
            variant="outlined"
            endIcon={<ContentCopyIcon />}
            sx={{ gap: 1, whiteSpace: "nowrap", px: 2.5 }}
            onClick={() => copyToClipboard(message.email)}
          >
            העתקת מייל
          </Button>

          <Button
            variant="outlined"
            endIcon={<ContentCopyIcon />}
            sx={{ gap: 1, whiteSpace: "nowrap", px: 2.5 }}
            onClick={() => copyToClipboard(message.phone)}
          >
            העתקת טלפון
          </Button>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* ניהול פנייה (מנהל) */}
        <Typography variant="h6">עריכת סטטוס והערת מנהל</Typography>

        <TextField
          select
          required
          label="סטטוס"
          value={values.status}
          onChange={(e) => setField("status", e.target.value as any)}
          error={Boolean(errors.status)}
          helperText={errors.status ?? " "}
          sx={{ maxWidth: 320 }}
        >
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="הערת מנהל (רשות, עד 300 תווים)"
          value={values.adminNote}
          onChange={(e) => setField("adminNote", e.target.value)}
          multiline
          minRows={3}
          error={Boolean(errors.adminNote)}
          helperText={errors.adminNote ?? `${values.adminNote.length}/300`}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/contacts")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}