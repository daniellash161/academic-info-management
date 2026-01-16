import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import type { Course } from "../../models/course";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

function normalizeSemesterLabel(s: Course["semester"]) {
  if (s === "א") return "סמסטר א";
  if (s === "ב") return "סמסטר ב";
  return "סמסטר קיץ";
}

function splitToParagraphs(raw: string) {
  const text = (raw ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];
  return text
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function UserCourseDetailsPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const snackbar = useSnackbar();
  const snackbarRef = useRef(snackbar);
  useEffect(() => {
    snackbarRef.current = snackbar;
  }, [snackbar]);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const decoded = decodeURIComponent(code ?? "").trim();
        const c = decoded ? coursesService.getByCode(decoded) : undefined;

        if (!alive) return;

        if (!c) {
          setNotFound(true);
          setCourse(null);
          return;
        }

        setCourse(await c);
      } catch (e: any) {
        if (!alive) return;
        snackbarRef.current.show(e?.message ?? "שגיאה בטעינת קורס");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, [code]);

  const title = course ? `${course.code} — ${course.name}` : "";

  const syllabusText = useMemo(() => {
    const s = course?.syllabus?.trim() ? course.syllabus.trim() : "";
    return s;
  }, [course]);

  const paragraphs = useMemo(
    () => splitToParagraphs(syllabusText),
    [syllabusText]
  );

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          onClose={snackbar.close}
        />
      </Box>
    );
  }

  if (notFound || !course) {
    return (
      <Box>
        <Alert severity="error">קורס לא נמצא</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={() => navigate("/user/courses")}
        >
          חזרה לרשימת קורסים
        </Button>
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          onClose={snackbar.close}
        />
      </Box>
    );
  }

  return (
    <Box dir="rtl" sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }} noWrap>
            {title}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={normalizeSemesterLabel(course.semester)}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`נק״ז: ${course.credits}`}
            />
          </Stack>
        </Box>

        <Button variant="outlined" onClick={() => navigate("/user/courses")}>
          חזרה
        </Button>
      </Stack>

      <Paper sx={{ p: 3, borderRadius: 5 }}>
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 900 }}>סילבוס</Typography>
          <Divider />

          {paragraphs.length === 0 ? (
            <Typography sx={{ opacity: 0.85 }}>אין סילבוס להצגה.</Typography>
          ) : (
            <Stack spacing={2}>
              {paragraphs.map((p, idx) => (
                <Typography
                  key={idx}
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 2,
                    fontSize: 16,
                    opacity: 0.92,
                    textAlign: "start",
                    direction: "rtl",
                    unicodeBidi: "plaintext",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {p}
                </Typography>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
