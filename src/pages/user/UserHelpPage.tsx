import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RuleIcon from "@mui/icons-material/Rule";
import { useNavigate } from "react-router-dom";

import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

function timeoutPromise(ms: number, label: string) {
  return new Promise<never>((_, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
    void t;
  });
}

export function UserHelpPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([]);

  const loadIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const myLoadId = ++loadIdRef.current;

    const run = async () => {
      setLoading(true);

      try {
        const data = await Promise.race([
          faqsService.getAll(),
          timeoutPromise(12000, "faqs"),
        ]);

        if (!alive) return;
        if (loadIdRef.current !== myLoadId) return;

        setFaqs(Array.isArray(data) ? (data as Faq[]) : []);
      } catch (e: any) {
        if (!alive) return;
        if (loadIdRef.current !== myLoadId) return;

        snackbar.show(e?.message ?? "שגיאה בטעינת שאלות נפוצות");
        setFaqs([]);
      } finally {
        if (!alive) return;
        if (loadIdRef.current !== myLoadId) return;

        setLoading(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;

    return faqs.filter((f) => {
      const hay = `${f.question} ${f.answer}`.toLowerCase();
      return hay.includes(q);
    });
  }, [faqs, query]);

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 5,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.18), rgba(16,185,129,0.10))",
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            עזרה ותמיכה
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 860 }}>
            כאן ניתן למצוא תשובות מהירות ולעבור לעמודים מרכזיים במערכת.
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mt: 1 }}
          >
            <TextField
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              label="חיפוש בשאלות נפוצות..."
            />

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Chip label={`שאלות: ${faqs.length}`} />
              <Chip label={`מוצגות: ${filtered.length}`} variant="outlined" />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              שאלות נפוצות
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {!loading && filtered.length === 0 ? (
            <Typography sx={{ opacity: 0.8 }}>לא נמצאו תוצאות.</Typography>
          ) : (
            <Stack spacing={1.25}>
              {filtered.map((f) => (
                <Accordion
                  key={f.id}
                  disableGutters
                  sx={{ borderRadius: 3, overflow: "hidden" }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 900 }}>
                      {f.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        opacity: 0.9,
                        lineHeight: 1.75,
                      }}
                    >
                      {f.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </Paper>

        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
              קישורים מהירים
            </Typography>

            <Stack spacing={1.25}>
              <Button
                fullWidth
                variant="contained"
                endIcon={<AssignmentIcon />}
                onClick={() => navigate("/user/request")}
                sx={{
                  justifyContent: "space-between",
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.2,
                  fontWeight: 900,
                  "& .MuiButton-endIcon": { m: 0, ml: 1 },
                }}
              >
                הגשת בקשת הרשמה
              </Button>

              <Button
                fullWidth
                variant="outlined"
                endIcon={<RuleIcon />}
                onClick={() => navigate("/user/requirements")}
                sx={{
                  justifyContent: "space-between",
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 900,
                  "& .MuiButton-endIcon": { m: 0, ml: 1 },
                }}
              >
                דרישות קבלה
              </Button>

              <Button
                fullWidth
                variant="outlined"
                endIcon={<MenuBookIcon />}
                onClick={() => navigate("/user/courses")}
                sx={{
                  justifyContent: "space-between",
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 900,
                  "& .MuiButton-endIcon": { m: 0, ml: 1 },
                }}
              >
                קורסים
              </Button>

              <Button
                fullWidth
                variant="outlined"
                endIcon={<EventIcon />}
                onClick={() => navigate("/user/deadlines")}
                sx={{
                  justifyContent: "space-between",
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 900,
                  "& .MuiButton-endIcon": { m: 0, ml: 1 },
                }}
              >
                מועדי הרשמה
              </Button>
            </Stack>

            <Paper
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: 5,
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.18))",
              }}
            >
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>טיפ קטן</Typography>
              <Typography sx={{ opacity: 0.85, lineHeight: 1.7 }}>
                לא מצאת תשובה? נסי לחפש לפי מילת מפתח קצרה (למשל: “מועדים”,
                “קורסים”, “בקשה”).
              </Typography>
            </Paper>
          </Paper>
        </Stack>
      </Box>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
