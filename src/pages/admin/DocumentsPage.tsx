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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { ApplicationDocument, DocumentStatus } from "../../models/applicationDocument";
import { documentsService } from "../../services/documentsService";
import { usersService } from "../../services/usersService";

export function DocumentsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ApplicationDocument[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "ALL">("ALL");

  function refresh() {
    setRows(documentsService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return documentsService.search(query, statusFilter);
  }, [query, statusFilter, rows]);

  function onDelete(id: string) {
    documentsService.remove(id);
    refresh();
  }

  const statuses = documentsService.statuses();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול מסמכי הרשמה</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/documents/new")}>
          הוספת מסמך
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 840 }}>
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
          fullWidth
          label="חיפוש לפי כותרת / סוג / מועמד / הערות"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מועמד</TableCell>
              <TableCell>סוג מסמך</TableCell>
              <TableCell>כותרת</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>תאריך העלאה</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((d) => {
              const cand = usersService.getById(d.candidateId);
              return (
                <TableRow key={d.id} hover>
                  <TableCell>{cand?.fullName ?? "(מועמד לא נמצא)"}</TableCell>
                  <TableCell>{d.docType}</TableCell>
                  <TableCell>{d.title}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell>{d.uploadedAt ?? "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/admin/documents/${d.id}/edit`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(d.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין מסמכים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}