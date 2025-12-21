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
import type { Requirement, RequirementType } from "../../models/requirement";
import { requirementsService } from "../../services/requirementsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function RequirementsPage() {
  const [rows, setRows] = useState<Requirement[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RequirementType | "ALL">("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Requirement | null>(null);

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const types = requirementsService.types();

  function refresh() {
    setRows(requirementsService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
      if (!q) return true;

      const title = r.title.toLowerCase();
      const type = String(r.type).toLowerCase();
      const desc = (r.description ?? "").toLowerCase();

      return title.includes(q) || type.includes(q) || desc.includes(q);
    });
  }, [rows, query, typeFilter]);

  function askDelete(r: Requirement) {
    setDeleteTarget(r);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    requirementsService.remove(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    snackbar.show("הדרישה נמחקה בהצלחה");
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול דרישות קבלה</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/requirements/new")}>
          הוספת דרישה חדשה
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 720 }}>
        <TextField
          select
          label="סינון לפי סוג"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          sx={{ width: 220 }}
        >
          <MenuItem value="ALL">כל הסוגים</MenuItem>
          {types.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="חיפוש לפי שם / סוג / תיאור"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>סוג</TableCell>
              <TableCell>כותרת</TableCell>
              <TableCell>מינימום ציון</TableCell>
              <TableCell>חובה</TableCell>
              <TableCell>סדר תצוגה</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.minScore}</TableCell>
                <TableCell>{r.isMandatory ? "כן" : "לא"}</TableCell>
                <TableCell>{r.displayOrder}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" onClick={() => navigate(`/admin/requirements/${r.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => askDelete(r)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין דרישות במערכת
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>מחיקת דרישת קבלה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם למחוק את הדרישה{deleteTarget ? ` "${deleteTarget.title}"` : ""} לצמיתות?
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