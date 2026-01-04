import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { ContactMessage } from "../../models/contactMessage";
import { contactMessagesService } from "../../services/contactMessagesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type ViewFilter = "ACTIVE" | "ARCHIVE" | "ALL";

export function ContactMessagesPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessage["status"] | "ALL">("ALL");
  const [view, setView] = useState<ViewFilter>("ACTIVE");

  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  async function refresh() {
    const items = await contactMessagesService.getAll();
    setRows(items);
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const items =
          statusFilter === "ALL"
            ? await contactMessagesService.search(query, "ALL")
            : await contactMessagesService.search(query, statusFilter);

        setRows(items);
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת פניות");
      }
    })();
  }, [query, statusFilter]);

  const statuses = contactMessagesService.statuses();

  const filtered = useMemo(() => {
    const base = rows;

    if (view === "ACTIVE") return base.filter((m) => m.status !== "נסגר");
    if (view === "ARCHIVE") return base.filter((m) => m.status === "נסגר");
    return base;
  }, [rows, view]);

  function askDelete(m: ContactMessage) {
    setDeleteTarget(m);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await contactMessagesService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      snackbar.show("הפנייה נמחקה בהצלחה");
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה במחיקה");
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול פניות צור קשר</Typography>

        <Button variant="contained" onClick={() => navigate("/admin/help")}>
          מעבר למסך עזרה/צור קשר
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 1100, flexWrap: "wrap" }}>
        <TextField
          select
          label="תצוגה"
          value={view}
          onChange={(e) => setView(e.target.value as ViewFilter)}
          sx={{ width: 220 }}
        >
          <MenuItem value="ACTIVE">פניות פתוחות</MenuItem>
          <MenuItem value="ARCHIVE">ארכיון (נסגר)</MenuItem>
          <MenuItem value="ALL">הכל</MenuItem>
        </TextField>

        <TextField
          select
          label="סינון לפי סטטוס"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          sx={{ width: 220 }}
        >
          <MenuItem value="ALL">הכל</MenuItem>
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          sx={{ minWidth: 420, flexGrow: 1 }}
          label="חיפוש לפי שם / מייל / טלפון / נושא / הודעה / הערות"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>תאריך</TableCell>
              <TableCell>שם</TableCell>
              <TableCell>נושא</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.createdAt.slice(0, 10)}</TableCell>
                <TableCell>{m.fullName}</TableCell>
                <TableCell>{m.subject}</TableCell>
                <TableCell>{m.status}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/contacts/${m.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => askDelete(m)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  אין פניות להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת פנייה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את הפנייה
            {deleteTarget ? ` "${deleteTarget.subject}"` : ""} לצמיתות?
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