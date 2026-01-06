import { useEffect, useMemo, useRef, useState } from "react";
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
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
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
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<RegistrationDeadline | null>(null);

  const loadSeq = useRef(0);

  useEffect(() => {
    const seq = ++loadSeq.current;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        let items = await registrationDeadlinesService.search(query);

        if (activeFilter === "ACTIVE") items = items.filter((d) => d.isActive);
        if (activeFilter === "INACTIVE") items = items.filter((d) => !d.isActive);

        if (seq !== loadSeq.current) return;
        setRows(items);
      } catch (e: any) {
        if (seq !== loadSeq.current) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת מועדי הרשמה");
      } finally {
        if (seq !== loadSeq.current) return;
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [query, activeFilter, snackbar]);

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
      snackbar.show("מועד ההרשמה נמחק בהצלחה");
      setQuery((x) => x);
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
    }
  }

  return (
    <Box>
      <LinearProgress sx={{ opacity: loading ? 1 : 0, transition: "opacity 200ms" }} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול מועדי הרשמה</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/deadlines/new")}>
          הוספת מועד הרשמה
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 900 }}>
        <TextField
          select
          label="סינון לפי פעילות"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
          sx={{ width: 220 }}
        >
          <MenuItem value="ALL">הכל</MenuItem>
          <MenuItem value="ACTIVE">פעיל</MenuItem>
          <MenuItem value="INACTIVE">לא פעיל</MenuItem>
        </TextField>

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