import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { Course, Semester } from "../../models/course";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  name: string;
  code: string;
  semester: Semester | "";
  credits: number | "";
  prerequisites: string; // נקליד CSV של קודי קורס: "CS101,CS102"
  syllabus: string;
  lecturer: string;
};

function parsePrereq(csv: string) {
  return csv
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function validate(values: FormState, isEdit: boolean) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  // שם קורס חובה עד 50
  if (!values.name.trim()) errors.name = "שדה חובה";
  else if (values.name.trim().length > 50) errors.name = "עד 50 תווים";

  // קוד חובה, ייחודי (רק ביצירה)
  if (!values.code.trim()) errors.code = "שדה חובה";
  else if (!/^[A-Za-z0-9_-]+$/.test(values.code.trim())) errors.code = "קוד יכול להכיל אותיות/ספרות/_- בלבד";
  else if (!isEdit && coursesService.getByCode(values.code)) errors.code = "קוד קורס חייב להיות ייחודי";

  // סמסטר חובה
  if (!values.semester) errors.semester = "שדה חובה";

  // נק״ז חובה בין 1-5
  if (values.credits === "") errors.credits = "שדה חובה";
  else if (![1, 2, 3, 4, 5].includes(Number(values.credits))) errors.credits = "נק״ז חייב להיות בין 1 ל-5";

  // קורסי קדם: אם יש—חייבים להיות קיימים במערכת
  const prereq = parsePrereq(values.prerequisites);
  for (const p of prereq) {
    if (!coursesService.getByCode(p)) {
      errors.prerequisites = `קורס קדם לא קיים: ${p}`;
      break;
    }
  }

  return errors;
}

export function CourseFormPage() {
  const { code } = useParams();
  const isEdit = Boolean(code);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [values, setValues] = useState<FormState>({
    name: "",
    code: "",
    semester: "א",
    credits: 3,
    prerequisites: "",
    syllabus: "",
    lecturer: "",
  });

  useEffect(() => {
    if (!code) return;
    const existing = coursesService.getByCode(decodeURIComponent(code));
    if (!existing) return;

    setValues({
      name: existing.name,
      code: existing.code,
      semester: existing.semester,
      credits: existing.credits,
      prerequisites: (existing.prerequisites ?? []).join(", "),
      syllabus: existing.syllabus ?? "",
      lecturer: existing.lecturer ?? "",
    });
  }, [code]);

  const errors = useMemo(() => validate(values, isEdit), [values, isEdit]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!canSave) return;

    const payload: Course = {
      name: values.name.trim(),
      code: values.code.trim(),
      semester: values.semester as Semester,
      credits: Number(values.credits),
      prerequisites: parsePrereq(values.prerequisites),
      syllabus: values.syllabus.trim() ? values.syllabus.trim() : undefined,
      lecturer: values.lecturer.trim() ? values.lecturer.trim() : undefined,
    };

    try {
      if (isEdit && code) {
        coursesService.update(decodeURIComponent(code), {
          name: payload.name,
          semester: payload.semester,
          credits: payload.credits,
          prerequisites: payload.prerequisites,
          syllabus: payload.syllabus,
          lecturer: payload.lecturer,
        });
        snackbar.show("הקורס עודכן בהצלחה");
      } else {
        coursesService.create(payload);
        snackbar.show("הקורס נשמר בהצלחה");
      }

      // לפי התכנון: אחרי הוספה/עדכון חוזרים לרשימת הקורסים  [oai_citation:8‡תכנון פרויקט.pdf](sediment://file_0000000028ac71f4b005d298449f87bc)
      navigate("/admin/courses");
    } catch (e: any) {
      // אם זרק שגיאה לוגית (קוד לא ייחודי / prereq לא קיים)
      alert(e?.message ?? "שגיאה בשמירה");
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? `עריכת קורס ${decodeURIComponent(code!)}` : "הוספת קורס חדש"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <TextField
          label="שם קורס"
          required
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name ?? " "}
        />

        <TextField
          label="קוד קורס"
          required
          value={values.code}
          onChange={(e) => setField("code", e.target.value)}
          error={Boolean(errors.code)}
          helperText={errors.code ?? (isEdit ? "קוד לא ניתן לשינוי בעריכה" : " ")}
          disabled={isEdit}
        />

        <TextField
          select
          label="סמסטר"
          required
          value={values.semester}
          onChange={(e) => setField("semester", e.target.value as any)}
          error={Boolean(errors.semester)}
          helperText={errors.semester ?? " "}
        >
          <MenuItem value="א">א</MenuItem>
          <MenuItem value="ב">ב</MenuItem>
          <MenuItem value="קיץ">קיץ</MenuItem>
        </TextField>

        <TextField
          select
          label='נקודות זכות (1-5)'
          required
          value={values.credits}
          onChange={(e) => setField("credits", Number(e.target.value) as any)}
          error={Boolean(errors.credits)}
          helperText={errors.credits ?? " "}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="קורסי קדם (רשות) — קודים מופרדים בפסיק"
          value={values.prerequisites}
          onChange={(e) => setField("prerequisites", e.target.value)}
          error={Boolean(errors.prerequisites)}
          helperText={errors.prerequisites ?? "לדוגמה: CS101, CS102"}
        />

        <TextField
          label="מרצה אחראי (רשות)"
          value={values.lecturer}
          onChange={(e) => setField("lecturer", e.target.value)}
        />

        <TextField
          label="סילבוס (רשות)"
          value={values.syllabus}
          onChange={(e) => setField("syllabus", e.target.value)}
          multiline
          minRows={4}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
            שמירה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/courses")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}