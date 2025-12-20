import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
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

export function CoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function refresh() {
    setRows(coursesService.getAll());
  }

  useEffect(() => {
    refresh(); // טעינה ראשונית מה-localStorage (כמו המחוון)
  }, []);

  const filtered = useMemo(() => {
    return coursesService.search(query);
  }, [query, rows]); // rows כדי לרענן אחרי מחיקה/עדכון

  function onDelete(code: string) {
    coursesService.remove(code);
    refresh();
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול קורסים</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/courses/new")}>
          הוספת קורס חדש
        </Button>
      </Box>

      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <TextField
          fullWidth
          label="חיפוש לפי שם / קוד / מרצה"
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
              <TableCell>מרצה</TableCell>
              <TableCell>נק״ז</TableCell>
              <TableCell>סמסטר</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.code} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.code}</TableCell>
                <TableCell>{c.lecturer ?? "-"}</TableCell>
                <TableCell>{c.credits}</TableCell>
                <TableCell>{c.semester}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/courses/${encodeURIComponent(c.code)}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(c.code)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין קורסים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}