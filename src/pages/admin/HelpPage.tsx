import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type ContactForm = {
  fullName: string;
  email: string;
  message: string;
};

export function HelpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    email: "",
    message: "",
  });

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.fullName.trim()) e.fullName = "שדה חובה";
    if (!form.email.trim()) e.email = "שדה חובה";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "אימייל לא תקין";
    if (!form.message.trim()) e.message = "שדה חובה";
    return e;
  }, [form]);

  const canSend = Object.keys(errors).length === 0;

  function setField<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSend() {
    if (!canSend) return;
    // טופס פניה מהיר - ללא שמירה (סטטי/דמה לפי פרויקט)
    alert("הפנייה נשלחה בהצלחה (דמו)");
    setForm({ fullName: "", email: "", message: "" });
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        עזרה ותמיכה – מנהל מערכת
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* הסבר כללי */}
          <Box>
            <Typography variant="h6">מטרת המסך</Typography>
            <Typography>
              מסך זה נועד לספק למנהל המערכת מידע תומך והדרכה לשימוש נכון במערכת:
              ניהול מועמדים, בקשות הרשמה, קורסים ודרישות קבלה, כולל דגשים להזנת נתונים תקינים,
              שאלות נפוצות וטיפים לפתרון תקלות.
            </Typography>
          </Box>

          <Divider />

          {/* הסבר לפי חלקי מערכת */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              הסברים לפי חלקי המערכת
            </Typography>

            <Stack spacing={1}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>ניהול מועמדים</Typography>
                <Typography>
                  צפייה, הוספה ועריכה של מועמדים. מומלץ לוודא שכל שדות החובה מלאים ושהמידע תואם את
                  כללי התקינות (אימייל תקין, מספר ת״ז באורך תקין וכו׳).
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>בקשות הרשמה</Typography>
                <Typography>
                  יצירת בקשת הרשמה חדשה ושיוך למועמד קיים. סטטוסים נתמכים: בטיוטה, נשלחה, מאושרת,
                  נדחתה. תאריך יצירה לא יכול להיות עתידי.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>קורסים</Typography>
                <Typography>
                  ניהול קורסים כולל חיפוש לפי שם/קוד/מרצה. קוד קורס חייב להיות ייחודי ונק״ז חייב
                  להיות בין 1 ל-5. קורסי קדם (אם הוזנו) חייבים להיות קיימים במערכת.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>דרישות קבלה</Typography>
                <Typography>
                  ניהול דרישות קבלה כולל סינון לפי סוג וחיפוש. ניתן להגדיר דרישת חובה וסדר תצוגה
                  להצגה מסודרת.
                </Typography>
              </Paper>
            </Stack>
          </Box>

          <Divider />

          {/* דגשים להזנת נתונים תקינים */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              דגשים להזנת נתונים תקינים
            </Typography>
            <Typography>
              • שדות חובה מסומנים בכוכבית (*).
              <br />
              • אימייל חייב להיות בפורמט תקין (למשל name@example.com).
              <br />
              • ת״ז מומלץ להזין כמספר באורך תקין (ללא רווחים/תווים מיוחדים).
              <br />
              • בטפסים לא ניתן לשמור כאשר קיימות שגיאות – השדות השגויים מסומנים באדום ומופיעה
              הודעת שגיאה מתחת לשדה.
            </Typography>
          </Box>

          <Divider />

          {/* FAQ */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              שאלות נפוצות (FAQ)
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>איך חוזרים למסך הבית מכל מקום?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  ניתן ללחוץ על בית בתפריט/Drawer, או על שם האפליקציה ב-Header (אם הוגדר כך).
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>למה אני לא מצליחה לשמור טופס?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  כשיש שגיאות תקינות קלט, השדה יסומן באדום ותופיע הודעת שגיאה מתחת לשדה. תקני את
                  השדות המסומנים ואז כפתור השמירה יתאפשר.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>למה אין נתונים בטבלאות?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  הנתונים נטענים מ-LocalStorage. אם מחקת את ה-LocalStorage, רענון הדף יפעיל טעינת
                  Seed (כאשר ה-storage ריק).
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>איך להגיע מהר למסך הרלוונטי?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  השתמשי בתפריט הניווט (Drawer). אפשר גם להיכנס למסך הבית וללחוץ על כרטיסים/כפתורי
                  גישה מהירה.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Divider />

          {/* קישורים רלוונטיים */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              קישורים רלוונטיים (ניווט מהיר)
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button variant="contained" onClick={() => navigate("/admin/candidates")}>
                ניהול מועמדים
              </Button>
              <Button variant="contained" onClick={() => navigate("/admin/requests")}>
                ניהול בקשות
              </Button>
              <Button variant="contained" onClick={() => navigate("/admin/courses")}>
                ניהול קורסים
              </Button>
              <Button variant="contained" onClick={() => navigate("/admin/requirements")}>
                דרישות קבלה
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* טיפים לתקלות */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              טיפים לפתרון תקלות
            </Typography>
            <Typography>
              • אם הנתונים לא מתעדכנים אחרי שמירה/מחיקה — רענני את הדף.
              <br />
              • אם משהו “נעלם” — בדקי שהסינון/החיפוש לא פעילים.
              <br />
              • אם יש שגיאה — פתחי Console ובדקי הודעות (חשוב במיוחד לפני הגשה).
            </Typography>
          </Box>

          <Divider />

          {/* פרטי קשר + טופס פנייה מהיר */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              יצירת קשר
            </Typography>
            <Typography sx={{ mb: 2 }}>
              לתמיכה טכנית: support@csih.local
              <br />
              לפניות מנהליות: admin@csih.local
            </Typography>

            <Typography fontWeight={700} sx={{ mb: 1 }}>
              טופס פנייה מהיר
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 520 }}>
              <TextField
                label="שם מלא"
                required
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName ?? " "}
              />

              <TextField
                label="אימייל"
                required
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email ?? " "}
              />

              <TextField
                label="תוכן הפנייה"
                required
                multiline
                minRows={3}
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                error={Boolean(errors.message)}
                helperText={errors.message ?? " "}
              />

              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={onSend} disabled={!canSend}>
                  שליחת פנייה
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setForm({ fullName: "", email: "", message: "" })}
                >
                  ניקוי
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}