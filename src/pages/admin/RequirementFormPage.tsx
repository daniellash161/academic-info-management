import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { Requirement, RequirementType } from "../../models/requirement";
import { requirementsService } from "../../services/requirementsService";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";
import type { Course } from "../../models/course";

type FormState = {
  type: RequirementType | "";
  minScore: number | "";
  title: string;
  description: string;
  extraInfo: string;
  displayOrder: number | "";
  isMandatory: boolean;
  courseCodes: string[];
};

function validate(v: FormState, validCourseCodes: Set<string>) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!v.type) errors.type = "שדה חובה";
  if (!v.title.trim()) errors.title = "שדה חובה";

  if (v.minScore === "") errors.minScore = "שדה חובה";
  else if (Number(v.minScore) < 0) errors.minScore = "ציון חייב להיות >= 0";

  if (v.displayOrder === "") errors.displayOrder = "שדה חובה";
  else if (!Number.isInteger(Number(v.displayOrder)) || Number(v.displayOrder) < 1) {
    errors.displayOrder = "סדר תצוגה חייב להיות מספר שלם >= 1";
  }

  if (validCourseCodes.size > 0) {
    for (const code of v.courseCodes) {
      if (!validCourseCodes.has(code)) {
        errors.courseCodes = `קורס לא קיים: ${code}`;
        break;
      }
    }
  }

  return errors;
}

export function RequirementFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const types = requirementsService.types();

  const [courses, setCourses] = useState<Course[]>([]);
  const validCourseCodes = useMemo(() => new Set(courses.map((c) => c.code)), [courses]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [notFound, setNotFound] = useState(false);

  const [values, setValues] = useState<FormState>({
    type: "",
    minScore: "",
    title: "",
    description: "",
    extraInfo: "",
    displayOrder: 1,
    isMandatory: false,
    courseCodes: [],
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCourses(true);
      try {
        const allCourses = await coursesService.getAll();
        if (!alive) return;
        setCourses(Array.isArray(allCourses) ? allCourses : []);
      } catch (e: any) {
        if (!alive) return;
        setCourses([]);
        snackbar.show(e?.message ?? "שגיאה בטעינת קורסים");
      } finally {
        if (!alive) return;
        setLoadingCourses(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [snackbar]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const existing = await requirementsService.getById(id);
        if (!existing) {
          setNotFound(true);
          return;
        }

        setValues({
          type: existing.type,
          minScore: existing.minScore,
          title: existing.title,
          description: existing.description ?? "",
          extraInfo: existing.extraInfo ?? "",
          displayOrder: existing.displayOrder,
          isMandatory: existing.isMandatory,
          courseCodes: existing.courseCodes ?? [],
        });
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת דרישה");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, snackbar]);

  const errors = useMemo(() => validate(values, validCourseCodes), [values, validCourseCodes]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    if (!canSave || loadingCourses) return;

    const payload: Omit<Requirement, "id"> = {
      type: values.type as RequirementType,
      minScore: Number(values.minScore),
      title: values.title.trim(),
      description: values.description.trim() ? values.description.trim() : undefined,
      extraInfo: values.extraInfo.trim() ? values.extraInfo.trim() : undefined,
      displayOrder: Number(values.displayOrder),
      isMandatory: values.isMandatory,
      courseCodes: values.courseCodes,
    };

    try {
      if (isEdit && id) {
        await requirementsService.update(id, payload);
        snackbar.show("הדרישה עודכנה בהצלחה");
      } else {
        await requirementsService.create(payload);
        snackbar.show("הדרישה נשמרה בהצלחה");
      }

      navigate("/admin/requirements");
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
    return (
      <Box>
        <Alert severity="error">Requirement not found</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/admin/requirements")}>
          חזרה לרשימה
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {loadingCourses && <LinearProgress />}

      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת דרישת קבלה" : "הוספת דרישת קבלה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 620 }}>
        <TextField
          select
          label="סוג דרישה"
          required
          value={values.type}
          onChange={(e) => setField("type", e.target.value as any)}
          error={Boolean(errors.type)}
          helperText={errors.type ?? " "}
        >
          <MenuItem value="">— בחרי סוג —</MenuItem>
          {types.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="מינימום ציון"
          required
          type="number"
          value={values.minScore}
          onChange={(e) => setField("minScore", e.target.value === "" ? "" : Number(e.target.value))}
          error={Boolean(errors.minScore)}
          helperText={errors.minScore ?? " "}
        />

        <TextField
          label="כותרת הדרישה"
          required
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? " "}
        />

        <TextField
          label="תיאור הדרישה (רשות)"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          multiline
          minRows={2}
        />

        <TextField
          label="מידע נוסף (רשות)"
          value={values.extraInfo}
          onChange={(e) => setField("extraInfo", e.target.value)}
          multiline
          minRows={2}
        />

        <TextField
          label="סדר תצוגה"
          required
          type="number"
          value={values.displayOrder}
          onChange={(e) => setField("displayOrder", e.target.value === "" ? "" : Number(e.target.value))}
          error={Boolean(errors.displayOrder)}
          helperText={errors.displayOrder ?? " "}
        />

        <TextField
          select
          label="קורסים רלוונטיים (רשות)"
          value={values.courseCodes}
          onChange={(e) => setField("courseCodes", e.target.value as unknown as string[])}
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              (selected as string[]).length ? (selected as string[]).join(", ") : "—",
          }}
          disabled={loadingCourses}
          error={Boolean(errors.courseCodes)}
          helperText={errors.courseCodes ?? "אפשר לבחור כמה קורסים, או להשאיר ריק"}
        >
          {courses.map((c) => {
            const checked = values.courseCodes.includes(c.code);
            return (
              <MenuItem key={c.code} value={c.code}>
                <Checkbox checked={checked} />
                <ListItemText primary={`${c.code} — ${c.name}`} />
              </MenuItem>
            );
          })}
        </TextField>

        <FormControlLabel
          control={
            <Switch
              checked={values.isMandatory}
              onChange={(e) => setField("isMandatory", e.target.checked)}
            />
          }
          label="דרישת חובה"
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => void onSave()} disabled={!canSave || loadingCourses}>
            שמור דרישה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/requirements")}>
            ביטול
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}