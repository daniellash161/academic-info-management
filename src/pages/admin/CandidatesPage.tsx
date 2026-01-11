import { useEffect, useRef, useState } from "react";
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
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
    }),
  ]);
}

export function CandidatesPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const snackbar = useSnackbar();

  const toastShownRef = useRef(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await withTimeout(usersService.getCandidates(), 8000, "candidates");
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

  useEffect(() => {
    const toast = (location.state as any)?.toast as string | undefined;
    if (!toast) return;
    if (toastShownRef.current) return;

    toastShownRef.current = true;
    snackbar.show(toast);
    navigate(location.pathname, { replace: true, state: null });

  }, [location.key]);

  function askDelete(u: User) {
    setDeleteTarget(u);
  }

  function cancelDelete() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    try {
      await withTimeout(usersService.remove(deleteTarget.id), 8000, "delete candidate");
      setDeleteTarget(null);
      await refresh();
      snackbar.show("המועמד נמחק בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box>
      {loading && <LinearProgress />}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול מועמדים</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/candidates/new")}>
          הוספת מועמד
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם מלא</TableCell>
              <TableCell>ת״ז</TableCell>
              <TableCell>מייל</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>תחום עניין</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.nationalId}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.interest ?? "-"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="edit"
                    onClick={() => navigate(`/admin/candidates/${encodeURIComponent(u.id)}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => askDelete(u)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין מועמדים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת מועמד</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את המועמד{deleteTarget ? ` "${deleteTarget.fullName}"` : ""} לצמיתות?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={cancelDelete} disabled={deleting}>
            ביטול
          </Button>
          <Button variant="contained" color="error" onClick={() => void confirmDelete()} disabled={deleting}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}