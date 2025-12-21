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
  FormControlLabel,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { Announcement } from "../../models/announcement";
import { announcementsService } from "../../services/announcementsService";

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Announcement[]>([]);
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  function refresh() {
    setRows(announcementsService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return announcementsService.search(query, activeOnly);
  }, [query, activeOnly, rows]);

  function onDelete(id: string) {
    announcementsService.remove(id);
    refresh();
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול עדכונים</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/announcements/new")}>
          הוספת עדכון חדש
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 720 }}>
        <TextField
          fullWidth
          label="חיפוש לפי כותרת / תוכן"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FormControlLabel
          control={<Switch checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />}
          label="רק פעילים"
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת</TableCell>
              <TableCell>תאריך פרסום</TableCell>
              <TableCell>פעיל</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.publishedAt}</TableCell>
                <TableCell>{a.isActive ? "כן" : "לא"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/announcements/${a.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(a.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  אין עדכונים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}