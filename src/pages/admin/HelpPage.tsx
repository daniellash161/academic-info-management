import { useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";

export function HelpPage() {
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqQuery, setFaqQuery] = useState("");

  useEffect(() => {
    setFaqs(faqsService.getAll());
  }, []);

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
      <Typography variant="h5" sx={{ mb: 2 }}>
        עזרה למנהל
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => navigate("/admin/faqs")}>
          ניהול שאלות נפוצות
        </Button>
        <Button variant="contained" onClick={() => navigate("/admin/contacts")}>
          ניהול פניות
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          שאלות נפוצות למנהל
        </Typography>

        <Box sx={{ mb: 2, maxWidth: 520 }}>
          <TextField
            fullWidth
            label="חיפוש בשאלות"
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
    </Box>
  );
}