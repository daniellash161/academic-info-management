import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../models/course";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function CoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  async function refresh() {
    setLoading(true);
    try {
      const data = await coursesService.getAll();
      setRows(data);
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c) => {
      const name = c.name.toLowerCase();
      const code = c.code.toLowerCase();
      const lecturer = (c.lecturer ?? "").toLowerCase();
      const year = String(c.year ?? "").toLowerCase();
      const semester = String(c.semester ?? "").toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        lecturer.includes(q) ||
        year.includes(q) ||
        semester.includes(q)
      );
    });
  }, [rows, query]);

  function askDelete(course: Course) {
    setDeleteTarget(course);
  }

  function cancelDelete() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    try {
      await coursesService.remove(deleteTarget.code);
      setDeleteTarget(null);
      await refresh();
      snackbar.show("הקורס נמחק בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box>
      {loading && <LinearProgress />}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5">ניהול קורסים</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/admin/courses/new")}
        >
          הוספת קורס חדש
        </Button>
      </Box>

      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <TextField
          fullWidth
          label="חיפוש לפי שם / קוד / מרצה / שנה"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>קוד</TableCell>
              <TableCell>שנה</TableCell>
              <TableCell>סמסטר</TableCell>
              <TableCell>מרצה</TableCell>
              <TableCell>נק״ז</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.code} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.code}</TableCell>
                <TableCell>{c.year}</TableCell>
                <TableCell>{c.semester}</TableCell>
                <TableCell>{c.lecturer ?? "-"}</TableCell>
                <TableCell>{c.credits}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="edit"
                    onClick={() =>
                      navigate(
                        `/admin/courses/${encodeURIComponent(c.code)}/edit`
                      )
                    }
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => askDelete(c)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  אין קורסים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת קורס</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את הקורס
            {deleteTarget
              ? ` "${deleteTarget.name}" (${deleteTarget.code})`
              : ""}{" "}
            לצמיתות?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={cancelDelete} disabled={deleting}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void confirmDelete()}
            disabled={deleting}
          >
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
