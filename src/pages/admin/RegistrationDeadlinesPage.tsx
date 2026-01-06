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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { RegistrationDeadline } from "../../models/registrationDeadline";
import { registrationDeadlinesService } from "../../services/registrationDeadlinesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

export function RegistrationDeadlinesPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<RegistrationDeadline[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");

  const [deleteTarget, setDeleteTarget] = useState<RegistrationDeadline | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const items = await registrationDeadlinesService.search(debouncedQuery);
        if (!alive) return;
        setRows(items);
      } catch (e: any) {
        if (!alive) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת מועדי הרשמה");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [debouncedQuery, snackbar]);

  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return rows;
    if (activeFilter === "ACTIVE") return rows.filter((x) => x.isActive);
    return rows.filter((x) => !x.isActive);
  }, [rows, activeFilter]);

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
      setRows((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      snackbar.show("מועד ההרשמה נמחק בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
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

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 720 }}>
        <TextField
          sx={{ flex: 1, maxWidth: 420 }}
          label="חיפוש לפי כותרת / תאריכים / הערות / סטטוס"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <TextField
          select
          sx={{ width: 220 }}
          label="סינון לפי פעילות"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
        >
          <MenuItem value="ALL">הכל</MenuItem>
          <MenuItem value="ACTIVE">פעיל</MenuItem>
          <MenuItem value="INACTIVE">לא פעיל</MenuItem>
        </TextField>
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

            {!loading && filtered.length === 0 && (
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