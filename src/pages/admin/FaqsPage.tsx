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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function FaqsPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<Faq[]>([]);
  const [query, setQuery] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const items = await faqsService.search(query, publishedOnly);
      setRows(items);
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בטעינת שאלות");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    void refresh();
  }, [query, publishedOnly]);

  const filtered = useMemo(() => rows, [rows]);

  function askDelete(faq: Faq) {
    setDeleteTarget(faq);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setLoading(true);
    try {
      await faqsService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      snackbar.show("השאלה נמחקה בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
      setLoading(false);
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

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 900, flexWrap: "wrap" }}>
        <TextField
          sx={{ minWidth: 360, flexGrow: 1 }}
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
                  <IconButton onClick={() => askDelete(f)}>
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

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת שאלה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את השאלה{deleteTarget ? ` "${deleteTarget.question}"` : ""} לצמיתות?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={cancelDelete} disabled={loading}>
            ביטול
          </Button>
          <Button variant="contained" color="error" onClick={() => void confirmDelete()} disabled={loading}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}