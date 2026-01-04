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
  LinearProgress,
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
import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export async function FaqsPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<Faq[]>([]);
  const [query, setQuery] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await faqsService.getAll();
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

  const filtered = await useMemo(() => {
    return faqsService.search(query, publishedOnly);
  }, [query, publishedOnly, rows]);

  function onAskDelete(id: string) {
    setDeleteTarget(id);
  }

  function onCancelDelete() {
    setDeleteTarget(null);
  }

  async function onConfirmDelete() {
    if (deleteTarget === null) return;
    try {
      await faqsService.remove(deleteTarget);
      setDeleteTarget(null);
      await refresh();
      snackbar.show("השאלה נמחקה בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
    }
  }

  return (
    <Box>
      {loading && <LinearProgress />}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול שאלות נפוצות</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/faqs/new")}>
          הוספת שאלה
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 900 }}>
        <TextField
          fullWidth
          label="חיפוש לפי שאלה / תשובה"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FormControlLabel
          control={
            <Switch checked={publishedOnly} onChange={(e) => setPublishedOnly(e.target.checked)} />
          }
          label="רק מפורסמות"
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>סדר</TableCell>
              <TableCell>שאלה</TableCell>
              <TableCell>מפורסם</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.id} hover>
                <TableCell>{f.displayOrder}</TableCell>
                <TableCell>{f.question}</TableCell>
                <TableCell>{f.isPublished ? "כן" : "לא"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/faqs/${f.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onAskDelete(f.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  אין שאלות להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={deleteTarget !== null} onClose={onCancelDelete}>
        <DialogTitle>מחיקת שאלה</DialogTitle>
        <DialogContent>
          <DialogContentText>האם למחוק את השאלה לצמיתות?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onCancelDelete}>
            ביטול
          </Button>
          <Button variant="contained" color="error" onClick={onConfirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}