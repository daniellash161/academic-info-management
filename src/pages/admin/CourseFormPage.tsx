import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { Course, Semester, Year } from "../../models/course";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type FormState = {
  name: string;
  code: string;
  year: Year | "";
  semester: Semester | "";
  credits: number | "";
  prerequisites: string[];
  syllabus: string;
  lecturer: string;
};

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

function validate(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!values.name.trim()) errors.name = "שדה חובה";
  else if (values.name.trim().length > 50) errors.name = "עד 50 תווים";

  if (!values.code.trim()) errors.code = "שדה חובה";
  else if (!/^[A-Za-z0-9_-]+$/.test(values.code.trim())) {
    errors.code = "קוד יכול להכיל אותיות/ספרות/_- בלבד";
  }

  if (!values.year) errors.year = "שדה חובה";
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
  const snackbarRef = useRef(snackbar);
  useEffect(() => {
    snackbarRef.current = snackbar;
  }, [snackbar]);

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [values, setValues] = useState<FormState>({
    name: "",
    code: "",
    year: "א",
    semester: "א",
    credits: 3,
    prerequisites: [],
    syllabus: "",
    lecturer: "",
  });

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(Boolean(isEdit));
      setNotFound(false);

      try {
        const all = await withTimeout(
          coursesService.getAll(),
          12000,
          "courses.getAll",
        );
        if (!alive) return;
        setAllCourses(all);

        if (!id) return;

        const existing = await withTimeout(
          coursesService.getByCode(decodeURIComponent(id)),
          12000,
          "courses.getByCode",
        );

        if (!alive) return;

        if (!existing) {
          setNotFound(true);
          return;
        }

        setValues({
          name: existing.name,
          code: existing.code,
          year: existing.year,
          semester: existing.semester,
          credits: existing.credits,
          prerequisites: uniq(existing.prerequisites ?? []),
          syllabus: existing.syllabus ?? "",
          lecturer: existing.lecturer ?? "",
        });
      } catch (e: any) {
        if (!alive) return;
        snackbarRef.current.show(e?.message ?? "שגיאה בטעינת קורס");
        if (isEdit) setNotFound(true);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const errors = useMemo(() => validate(values), [values]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const prereqOptions = useMemo(() => {
    const currentCode = (values.code ?? "").trim();
    return allCourses
      .filter((c) => c.code && c.code !== currentCode)
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [allCourses, values.code]);

  const prereqSelectedCourses = useMemo(() => {
    const picked = new Set(uniq(values.prerequisites));
    return prereqOptions.filter((c) => picked.has(c.code));
  }, [values.prerequisites, prereqOptions]);

  async function validatePrereqAgainstDb(): Promise<string | null> {
    const prereq = uniq(values.prerequisites);
    if (prereq.length === 0) return null;

    const codes = new Set(allCourses.map((c) => c.code));
    for (const p of prereq) {
      if (!codes.has(p)) return `קורס קדם לא קיים: ${p}`;
    }
    return null;
  }

  async function onSave() {
    if (Object.keys(errors).length !== 0 || saving) return;

    setSaving(true);
    try {
      const prereqError = await validatePrereqAgainstDb();
      if (prereqError) {
        snackbar.show(prereqError);
        return;
      }

      const payload: Course = {
        name: values.name.trim(),
        code: values.code.trim(),
        year: values.year as Year,
        semester: values.semester as Semester,
        credits: Number(values.credits),
        prerequisites: uniq(values.prerequisites),
        syllabus: values.syllabus.trim() ? values.syllabus.trim() : undefined,
        lecturer: values.lecturer.trim() ? values.lecturer.trim() : undefined,
      };

      if (isEdit && id) {
        await coursesService.update(decodeURIComponent(id), {
          name: payload.name,
          year: payload.year,
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
    } finally {
      setSaving(false);
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
      {saving && <LinearProgress sx={{ mb: 2 }} />}

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
          disabled={saving}
        />

        <TextField
          label="קוד קורס"
          required
          value={values.code}
          onChange={(e) => setField("code", e.target.value)}
          error={Boolean(errors.code)}
          helperText={errors.code ?? (isEdit ? "Code cannot be changed" : " ")}
          disabled={isEdit || saving}
        />

        <TextField
          select
          label="שנה"
          required
          value={values.year}
          onChange={(e) => setField("year", e.target.value as any)}
          error={Boolean(errors.year)}
          helperText={errors.year ?? " "}
          disabled={saving}
        >
          <MenuItem value="א">א</MenuItem>
          <MenuItem value="ב">ב</MenuItem>
          <MenuItem value="ג">ג</MenuItem>
        </TextField>

        <TextField
          select
          label="סמסטר"
          required
          value={values.semester}
          onChange={(e) => setField("semester", e.target.value as any)}
          error={Boolean(errors.semester)}
          helperText={errors.semester ?? " "}
          disabled={saving}
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
          disabled={saving}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          multiple
          options={prereqOptions}
          value={prereqSelectedCourses}
          getOptionLabel={(opt) => `${opt.name} (${opt.code})`}
          isOptionEqualToValue={(a, b) => a.code === b.code}
          onChange={(_, newValue) => {
            setField("prerequisites", uniq(newValue.map((c) => c.code)));
          }}
          renderInput={(params) => (
            <TextField {...params} label="קורסי קדם (בחירה מרשימה)" />
          )}
          disabled={saving}
        />

        <TextField
          label="מרצה אחראי (optional)"
          value={values.lecturer}
          onChange={(e) => setField("lecturer", e.target.value)}
          disabled={saving}
        />

        <TextField
          label="סילבוס (optional)"
          value={values.syllabus}
          onChange={(e) => setField("syllabus", e.target.value)}
          multiline
          minRows={4}
          disabled={saving}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => void onSave()}
            disabled={!canSave || saving}
          >
            שמירה
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/courses")}
            disabled={saving}
          >
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
