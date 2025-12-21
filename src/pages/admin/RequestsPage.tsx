import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
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
import type { RegistrationRequest, RequestStatus } from "../../models/registrationRequest";
import { requestsService } from "../../services/requestsService";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function RequestsPage() {
  const [rows, setRows] = useState<RegistrationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  function refresh() {
    setRows(requestsService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  function onAskDelete(requestNumber: number) {
    setDeleteTarget(requestNumber);
  }

  function onCancelDelete() {
    setDeleteTarget(null);
  }

  function onConfirmDelete() {
    if (deleteTarget === null) return;
    requestsService.remove(deleteTarget);
    setDeleteTarget(null);
    refresh();
    snackbar.show("הבקשה נמחקה בהצלחה");
  }

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  const statuses = requestsService.statuses();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול בקשות הרשמה</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/requests/new")}>
          הוספת בקשה
        </Button>
      </Box>

      <Box sx={{ mb: 2, maxWidth: 260 }}>
        <TextField
          select
          fullWidth
          label="סינון לפי סטטוס"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <MenuItem value="ALL">הכל</MenuItem>
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מס׳ בקשה</TableCell>
              <TableCell>מועמד</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>תאריך יצירה</TableCell>
              <TableCell>הערות</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((r) => {
              const candidate = usersService.getById(r.candidateId);
              return (
                <TableRow key={r.requestNumber} hover>
                  <TableCell>{r.requestNumber}</TableCell>
                  <TableCell>{candidate?.fullName ?? "(מועמד לא נמצא)"}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.createdAt}</TableCell>
                  <TableCell>{r.notes ? r.notes.slice(0, 40) : "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="edit"
                      onClick={() => navigate(`/admin/requests/${r.requestNumber}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => onAskDelete(r.requestNumber)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין בקשות להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={deleteTarget !== null} onClose={onCancelDelete}>
        <DialogTitle>מחיקת בקשה</DialogTitle>
        <DialogContent>
          <DialogContentText>האם למחוק את הבקשה לצמיתות?</DialogContentText>
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