import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
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
  prerequisites: string;
  syllabus: string;
  lecturer: string;
};

function parsePrereq(csv: string) {
  return csv
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!values.name.trim()) errors.name = "שדה חובה";
  else if (values.name.trim().length > 50) errors.name = "עד 50 תווים";

  if (!values.code.trim()) errors.code = "שדה חובה";
  else if (!/^[A-Za-z0-9_-]+$/.test(values.code.trim())) {
    errors.code = "קוד יכול להכיל אותיות/ספרות/_- בלבד";
  }

  if (!values.semester) errors.semester = "שדה חובה";

  if (values.credits === "") errors.credits = "שדה חובה";
  else if (![1, 2, 3, 4, 5].includes(Number(values.credits))) {
    errors.credits = "נק״ז חייב להיות בין 1 ל-5";
  }

  return errors;
}

export function CourseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [notFound, setNotFound] = useState(false);

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
    if (!id) return;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const existing = await coursesService.getByCode(decodeURIComponent(id));
        if (!existing) {
          setNotFound(true);
          return;
        }

        setValues({
          name: existing.name,
          code: existing.code,
          semester: existing.semester,
          credits: existing.credits,
          prerequisites: (existing.prerequisites ?? []).join(", "),
          syllabus: existing.syllabus ?? "",
          lecturer: existing.lecturer ?? "",
        });
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת קורס");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, snackbar]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function validatePrereqAgainstDb() {
    const prereq = parsePrereq(values.prerequisites);
    if (prereq.length === 0) return null;

    for (const p of prereq) {
      const exists = await coursesService.getByCode(p);
      if (!exists) return `קורס קדם לא קיים: ${p}`;
    }
    return null;
  }

  async function onSave() {
    if (!canSave) return;

    const prereqError = await validatePrereqAgainstDb();
    if (prereqError) {
      snackbar.show(prereqError);
      return;
    }

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
      if (isEdit && id) {
        await coursesService.update(decodeURIComponent(id), {
          name: payload.name,
          semester: payload.semester,
          credits: payload.credits,
          prerequisites: payload.prerequisites,
          syllabus: payload.syllabus,
          lecturer: payload.lecturer,
        });
        snackbar.show("הקורס עודכן בהצלחה");
      } else {
        await coursesService.create(payload);
        snackbar.show("הקורס נשמר בהצלחה");
      }

      navigate("/admin/courses");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בשמירה");
    }
  }

  if (loading) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  if (notFound) {
    return <Alert severity="error">Course not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? `עריכת קורס ${decodeURIComponent(id!)}` : "הוספת קורס חדש"}
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
          helperText={errors.code ?? " "}
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
          label="נקודות זכות (1-5)"
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
          label="קורסי קדם (comma-separated)"
          value={values.prerequisites}
          onChange={(e) => setField("prerequisites", e.target.value)}
        />

        <TextField
          label="מרצה אחראי"
          value={values.lecturer}
          onChange={(e) => setField("lecturer", e.target.value)}
        />

        <TextField
          label="סילבוס"
          value={values.syllabus}
          onChange={(e) => setField("syllabus", e.target.value)}
          multiline
          minRows={4}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => void onSave()} disabled={!canSave}>
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