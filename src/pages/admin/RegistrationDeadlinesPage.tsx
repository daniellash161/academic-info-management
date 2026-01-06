import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
import type { RegistrationDeadline } from "../../models/registrationDeadline";
import { registrationDeadlinesService } from "../../services/registrationDeadlinesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function RegistrationDeadlinesPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<RegistrationDeadline[]>([]);
  const [query, setQuery] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<RegistrationDeadline | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const items = await registrationDeadlinesService.getAll();
      setRows(items);
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בטעינת מועדי הרשמה");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await registrationDeadlinesService.search(query);
        setRows(items);
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת מועדי הרשמה");
      } finally {
        setLoading(false);
      }
    })();
  }, [query, snackbar]);

  const filtered = useMemo(() => rows, [rows]);

  function askDelete(d: RegistrationDeadline) {
    setDeleteTarget(d);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setLoading(true);
    try {
      await registrationDeadlinesService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      snackbar.show("מועד ההרשמה נמחק בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
      setLoading(false);
    }
  }

  return (
    <Box>
      {loading && <LinearProgress />}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול מועדי הרשמה</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/deadlines/new")}>
          הוספת מועד הרשמה
        </Button>
      </Box>

      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <TextField
          fullWidth
          label="חיפוש לפי כותרת / תאריכים / הערות / סטטוס"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת</TableCell>
              <TableCell>מתאריך</TableCell>
              <TableCell>עד תאריך</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>פעיל</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((d) => {
              const status = registrationDeadlinesService.statusOf(d);
              return (
                <TableRow key={d.id} hover>
                  <TableCell>{d.title}</TableCell>
                  <TableCell>{d.startDate}</TableCell>
                  <TableCell>{d.endDate}</TableCell>
                  <TableCell>
                    <Chip size="small" label={status} />
                  </TableCell>
                  <TableCell>{d.isActive ? "כן" : "לא"}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton onClick={() => navigate(`/admin/deadlines/${d.id}/edit`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => askDelete(d)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין מועדים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת מועד הרשמה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את מועד ההרשמה{deleteTarget ? ` "${deleteTarget.title}"` : ""} לצמיתות?
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