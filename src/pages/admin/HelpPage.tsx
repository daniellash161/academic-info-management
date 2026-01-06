import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import QuizIcon from "@mui/icons-material/Quiz";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export function HelpPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqQuery, setFaqQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const items = await faqsService.getAll();
        if (!alive) return;
        setFaqs(items);
      } catch (e: any) {
        if (!alive) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת שאלות נפוצות");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [snackbar]);

  const filteredFaqs = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => {
      const hay = [f.question, f.answer].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [faqs, faqQuery]);

  return (
    <Box>
      {loading && <LinearProgress />}

      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(34,197,94,0.12))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack spacing={0.5} sx={{ minWidth: 260 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HelpOutlineIcon />
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                עזרה למנהל
              </Typography>
            </Stack>
            <Typography sx={{ opacity: 0.8 }}>
              חיפוש מהיר בשאלות נפוצות וקישורים למסכי ניהול
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate("/admin/faqs")}
              sx={{ fontWeight: 900, borderRadius: 999 }}
            >
              ניהול שאלות נפוצות
            </Button>

            <Button
              variant="contained"
              startIcon={<ContactSupportIcon />}
              onClick={() => navigate("/admin/contacts")}
              sx={{ fontWeight: 900, borderRadius: 999 }}
            >
              ניהול פניות
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            שאלות נפוצות למנהל
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`סה״כ: ${faqs.length}`} size="small" />
            <Chip label={`מוצגות: ${filteredFaqs.length}`} size="small" />
          </Stack>
        </Stack>

        <Box sx={{ mb: 2, maxWidth: 560 }}>
          <TextField
            fullWidth
            value={faqQuery}
            onChange={(e) => setFaqQuery(e.target.value)}
            placeholder="חיפוש לפי שאלה או תשובה..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {filteredFaqs.length === 0 ? (
          <Typography sx={{ opacity: 0.8 }}>אין שאלות להצגה.</Typography>
        ) : (
          <Stack spacing={1}>
            {filteredFaqs.map((f) => (
              <Accordion key={f.id} disableGutters sx={{ borderRadius: 2, overflow: "hidden" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 900 }}>{f.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>{f.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Paper>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}