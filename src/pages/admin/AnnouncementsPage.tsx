import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
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
import type { Announcement } from "../../models/announcement";
import { announcementsService } from "../../services/announcementsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<Announcement[]>([]);
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  function refresh() {
    setRows(announcementsService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((a) => {
      if (activeOnly && !a.isActive) return false;
      if (!q) return true;

      const title = a.title.toLowerCase();
      const content = a.content.toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [rows, query, activeOnly]);

  function askDelete(a: Announcement) {
    setDeleteTarget(a);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    announcementsService.remove(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    snackbar.show("העדכון נמחק בהצלחה");
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
                  <IconButton aria-label="edit" onClick={() => navigate(`/admin/announcements/${a.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => askDelete(a)}>
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

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת עדכון</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את העדכון{deleteTarget ? ` "${deleteTarget.title}"` : ""} לצמיתות?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={cancelDelete}>
            ביטול
          </Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}