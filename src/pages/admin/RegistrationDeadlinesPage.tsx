import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { RegistrationDeadline } from "../../models/registrationDeadline";
import { registrationDeadlinesService } from "../../services/registrationDeadlinesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function RegistrationDeadlinesPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<RegistrationDeadline[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<RegistrationDeadline | null>(null);

  async function fetchRows(q: string): Promise<RegistrationDeadline[]> {
    const trimmed = q.trim();
    if (!trimmed) return registrationDeadlinesService.getAll();
    return registrationDeadlinesService.search(trimmed);
  }

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);

      const trimmed = query.trim();
      const debounceMs = trimmed ? 350 : 0;

      if (debounceMs) await sleep(debounceMs);
      if (!alive) return;

      try {
        const items = await fetchRows(query);
        if (!alive) return;
        setRows(items);
      } catch (e: any) {
        if (!alive) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת מועדי הרשמה");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, [query]);

  const filtered = useMemo(() => rows, [rows]);

  function askDelete(d: RegistrationDeadline) {
    setDeleteTarget(d);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await registrationDeadlinesService.remove(deleteTarget.id);
      setDeleteTarget(null);

      setLoading(true);
      const items = await fetchRows(query);
      setRows(items);

      snackbar.show("מועד ההרשמה נמחק בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
    } finally {
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
          <Button variant="outlined" onClick={cancelDelete}>
            ביטול
          </Button>
          <Button variant="contained" color="error" onClick={() => void confirmDelete()}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}