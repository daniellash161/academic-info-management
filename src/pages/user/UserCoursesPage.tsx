import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../models/course";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type StatCardProps = {
  title: string;
  value: string | number;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <Paper
      sx={{
        flex: "1 1 260px",
        minWidth: 260,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 3,
      }}
    >
      <Box sx={{ height: 4, bgcolor: "primary.main" }} />
      <Box sx={{ p: 2.25 }}>
        <Typography sx={{ fontWeight: 900, opacity: 0.8 }}>{title}</Typography>
        <Typography
          variant="h3"
          sx={{ fontWeight: 900, lineHeight: 1.1, mt: 0.75 }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

function normalizeSemesterLabel(s: Course["semester"]) {
  if (s === "א") return "סמסטר א";
  if (s === "ב") return "סמסטר ב";
  return "סמסטר קיץ";
}

export function UserCoursesPage() {
  const navigate = useNavigate();

  const snackbar = useSnackbar();
  const snackbarRef = useRef(snackbar);
  useEffect(() => {
    snackbarRef.current = snackbar;
  }, [snackbar]);

  const [rows, setRows] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const data = await coursesService.getAll();
        if (!alive) return;
        setRows(data);
      } catch (e: any) {
        if (!alive) return;
        snackbarRef.current.show(e?.message ?? "שגיאה בטעינת קורסים");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c) => {
      const hay = [
        c.code,
        c.name,
        c.semester,
        String(c.credits),
        (c.prerequisites ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, query]);

  const shownCourses = filtered.length;

  function goToSyllabus(course: Course) {
    const code = encodeURIComponent(course.code);
    navigate(`/user/courses/${code}`);
  }

  return (
    <Box>
      {loading && <LinearProgress />}

      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
            קורסים
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            צפייה ברשימת הקורסים הזמינים במערכת וחיפוש מהיר
          </Typography>
        </Box>

        <Chip
          sx={{ fontWeight: 900 }}
          label={loading ? "טוען..." : `מוצגים: ${shownCourses}`}
          variant="outlined"
        />
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 2 }}>
        <TextField
          fullWidth
          label="חיפוש לפי קוד / שם / סמסטר / נק״ז / קורסי קדם"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>קוד</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>שם קורס</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>מתי מתבצע</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>נק״ז</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>קורסי קדם</TableCell>
              <TableCell sx={{ fontWeight: 900 }} align="left">
                סילבוס
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((c) => {
              const prereq = (c.prerequisites ?? []).filter(Boolean);
              const hasSyllabus = Boolean(c.syllabus && c.syllabus.trim());

              return (
                <TableRow key={c.code} hover>
                  <TableCell sx={{ fontWeight: 900 }}>{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={normalizeSemesterLabel(c.semester)}
                    />
                  </TableCell>
                  <TableCell>{c.credits}</TableCell>
                  <TableCell>
                    {prereq.length === 0 ? (
                      "—"
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {prereq.map((p) => (
                          <Chip key={p} size="small" label={p} />
                        ))}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!hasSyllabus}
                      onClick={() => goToSyllabus(c)}
                      sx={{ fontWeight: 900, whiteSpace: "nowrap" }}
                    >
                      {hasSyllabus ? "צפייה" : "אין"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין קורסים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
