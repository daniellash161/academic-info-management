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
import type { ContactMessage } from "../../models/contactMessage";
import { contactMessagesService } from "../../services/contactMessagesService";

export function ContactMessagesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessage["status"] | "ALL">("ALL");

  function refresh() {
    setRows(contactMessagesService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return contactMessagesService.search(query, statusFilter);
  }, [query, statusFilter, rows]);

  function onDelete(id: string) {
    contactMessagesService.remove(id);
    refresh();
  }

  const statuses = contactMessagesService.statuses();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול פניות צור קשר</Typography>
        <Button variant="contained" onClick={() => navigate("/help")}>
          מעבר למסך עזרה/צור קשר
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 980 }}>
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
                  <IconButton onClick={() => onDelete(m.id)}>
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
    </Box>
  );
}