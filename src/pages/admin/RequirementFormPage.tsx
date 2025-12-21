import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { RequirementType } from "../../models/requirement";
import { requirementsService } from "../../services/requirementsService";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

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

function validate(v: FormState, validCourseCodes: string[]) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!v.type) errors.type = "שדה חובה";
  if (!v.title.trim()) errors.title = "שדה חובה";

  if (v.minScore === "") errors.minScore = "שדה חובה";
  else if (Number(v.minScore) < 0) errors.minScore = "ציון חייב להיות >= 0";

  if (v.displayOrder === "") errors.displayOrder = "שדה חובה";
  else if (!Number.isInteger(Number(v.displayOrder)) || Number(v.displayOrder) < 1) {
    errors.displayOrder = "סדר תצוגה חייב להיות מספר שלם >= 1";
  }

  const invalid = (v.courseCodes ?? []).filter((c) => !validCourseCodes.includes(c));
  if (invalid.length > 0) errors.courseCodes = "נבחרו קורסים לא קיימים";

  return errors;
}

export function RequirementFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const types = requirementsService.types();
  const courses = useMemo(() => coursesService.getAll(), []);
  const validCourseCodes = useMemo(() => courses.map((c) => c.code), [courses]);

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
    if (!id) return;
    const existing = requirementsService.getById(id);
    if (!existing) return;

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
  }, [id]);

  const errors = useMemo(() => validate(values, validCourseCodes), [values, validCourseCodes]);
  const canSave = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!canSave) return;

    const payload = {
      type: values.type as RequirementType,
      minScore: Number(values.minScore),
      title: values.title.trim(),
      description: values.description.trim() ? values.description.trim() : undefined,
      extraInfo: values.extraInfo.trim() ? values.extraInfo.trim() : undefined,
      displayOrder: Number(values.displayOrder),
      isMandatory: values.isMandatory,
      courseCodes: values.courseCodes ?? [],
    };

    if (isEdit && id) {
      requirementsService.update(id, payload);
      snackbar.show("הדרישה עודכנה בהצלחה");
    } else {
      requirementsService.create(payload);
      snackbar.show("הדרישה נשמרה בהצלחה");
    }

    navigate("/admin/requirements");
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "עריכת דרישת קבלה" : "הוספת דרישת קבלה"}
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 640 }}>
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

        <Box>
          <Typography sx={{ fontWeight: 800, mb: 0.5 }}>קורסים קשורים (רשות)</Typography>

          <Select
            multiple
            fullWidth
            value={values.courseCodes}
            onChange={(e) => setField("courseCodes", e.target.value as string[])}
            input={<OutlinedInput size="small" />}
            renderValue={(selected) => (selected.length ? selected.join(", ") : "— לא נבחרו —")}
            error={Boolean(errors.courseCodes)}
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
          </Select>

          <Typography variant="caption" sx={{ color: errors.courseCodes ? "error.main" : "text.secondary" }}>
            {errors.courseCodes ?? "בחרי קורסים שהדרישה הזו קשורה אליהם (אפשר להשאיר ריק)"}
          </Typography>
        </Box>

        <FormControlLabel
          control={<Switch checked={values.isMandatory} onChange={(e) => setField("isMandatory", e.target.checked)} />}
          label="דרישת חובה"
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onSave} disabled={!canSave}>
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