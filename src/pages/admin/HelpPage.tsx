import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

type HelpItem = {
  id: string;
  title: string;
  steps: string[];
  tips?: string[];
};

export function HelpPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const items: HelpItem[] = useMemo(
    () => [
      {
        id: "candidates",
        title: "ניהול מועמדים",
        steps: [
          'כניסה ל"תפריט > מועמדים".',
          'לחצי "הוספת מועמד" כדי ליצור מועמד חדש.',
          "מלאי שם, ת״ז, אימייל, טלפון ותפקיד.",
          'לחצי "שמירה".',
          "לעריכה: לחצי על אייקון העיפרון ליד המועמד.",
          "למחיקה: לחצי על אייקון הפח ואשרי מחיקה.",
        ],
        tips: ["מומלץ לשמור ת״ז ואימייל ייחודיים כדי למנוע כפילויות."],
      },
      {
        id: "requests",
        title: "ניהול בקשות הרשמה",
        steps: [
          'כניסה ל"תפריט > בקשות הרשמה".',
          'לחצי "הוספת בקשה".',
          "בחרי מועמד מהרשימה.",
          "בחרי סטטוס (טיוטה/נשלחה/מאושרת/נדחתה).",
          "בחרי תאריך יצירה והוסיפי הערה אם צריך.",
          'לחצי "שמירה".',
          "לעריכה/מחיקה השתמשי באייקונים בטבלה.",
        ],
        tips: ["אם אין מועמדים לבחירה בבקשה: ודאי שיש מועמדים במערכת."],
      },
      {
        id: "courses",
        title: "ניהול קורסים",
        steps: [
          'כניסה ל"תפריט > קורסים".',
          'לחצי "הוספת קורס".',
          "מלאי שם, קוד קורס, סמסטר ונק״ז.",
          "קורסי קדם: הזיני קודים מופרדים בפסיקים (אופציונלי).",
          'לחצי "שמירה".',
          "בעריכה: קוד הקורס נעול ולא משתנה.",
        ],
        tips: ["בקורסי קדם חובה להזין קודים שקיימים במערכת."],
      },
      {
        id: "requirements",
        title: "ניהול דרישות קבלה",
        steps: [
          'כניסה ל"תפריט > דרישות קבלה".',
          'לחצי "הוספת דרישה".',
          "בחרי סוג דרישה (פסיכומטרי/בגרות/אנגלית).",
          "הזיני מינימום ציון וכותרת.",
          "סדר תצוגה קובע את סדר ההופעה במסכים.",
          "אפשר לבחור קורסים רלוונטיים (אופציונלי).",
          'לחצי "שמור דרישה".',
        ],
        tips: ["אם שדה קורסים רלוונטיים ריק – עדיין אפשר לשמור."],
      },
      {
        id: "deadlines",
        title: "ניהול מועדי הרשמה",
        steps: [
          'כניסה ל"תפריט > מועדי הרשמה".',
          'לחצי "הוספת מועד הרשמה".',
          "מלאי כותרת, מתאריך, עד תאריך.",
          "סמני פעיל/לא פעיל.",
          'לחצי "שמירה".',
          "במסך הראשי ניתן לערוך/למחוק דרך האייקונים.",
        ],
        tips: ["סטטוס מחושב לפי היום: עתידי/פתוח/נסגר/לא פעיל."],
      },
      {
        id: "help",
        title: "שאלות נפוצות ופניות",
        steps: [
          'שאלות נפוצות: כניסה ל"תפריט > שאלות נפוצות" והוספה/עריכה/מחיקה לפי הצורך.',
          'פניות: כניסה ל"תפריט > פניות" לצפייה וטיפול בפניות שהתקבלו.',
        ],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      const hay = [x.title, x.steps.join(" "), (x.tips ?? []).join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 900 }}>
        עזרה למנהל מערכת
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "stretch" }}>
          <TextField
            fullWidth
            label="חיפוש בעזרה (למשל: מועמדים / קורסים / בקשות)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="contained" onClick={() => navigate("/admin/candidates")}>
              מועמדים
            </Button>
            <Button variant="contained" onClick={() => navigate("/admin/requests")}>
              בקשות
            </Button>
            <Button variant="contained" onClick={() => navigate("/admin/courses")}>
              קורסים
            </Button>
            <Button variant="contained" onClick={() => navigate("/admin/requirements")}>
              דרישות
            </Button>
            <Button variant="contained" onClick={() => navigate("/admin/deadlines")}>
              מועדים
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip label="מועמדים" onClick={() => setQuery("מועמדים")} />
        <Chip label="בקשות" onClick={() => setQuery("בקשות")} />
        <Chip label="קורסים" onClick={() => setQuery("קורסים")} />
        <Chip label="דרישות" onClick={() => setQuery("דרישות")} />
        <Chip label="מועדי הרשמה" onClick={() => setQuery("מועדי הרשמה")} />
        <Chip label="פניות" onClick={() => setQuery("פניות")} />
        <Chip label="איפוס חיפוש" variant="outlined" onClick={() => setQuery("")} />
      </Stack>

      {filtered.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography>לא נמצאו תוצאות.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filtered.map((x) => (
            <Paper key={x.id} sx={{ overflow: "hidden" }}>
              <Accordion defaultExpanded={filtered.length === 1}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 900 }}>{x.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {x.steps.map((s, idx) => (
                      <Typography key={idx} sx={{ lineHeight: 1.7 }}>
                        {idx + 1}. {s}
                      </Typography>
                    ))}

                    {x.tips && x.tips.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Tips</Typography>
                        <Stack spacing={0.5}>
                          {x.tips.map((t, idx) => (
                            <Typography key={idx} sx={{ opacity: 0.85 }}>
                              • {t}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}