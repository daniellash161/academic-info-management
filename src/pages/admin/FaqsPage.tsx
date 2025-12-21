// src/pages/admin/FaqsPage.tsx
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { Faq } from "../../models/faq";
import { faqsService } from "../../services/faqsService";

export function FaqsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Faq[]>([]);
  const [query, setQuery] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(false);

  function refresh() {
    setRows(faqsService.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return faqsService.search(query, publishedOnly);
  }, [query, publishedOnly, rows]);

  function onDelete(id: string) {
    faqsService.remove(id);
    refresh();
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">ניהול שאלות נפוצות</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/faqs/new")}>
          הוספת שאלה
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, maxWidth: 900 }}>
        <TextField
          fullWidth
          label="חיפוש לפי שאלה / תשובה"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FormControlLabel
          control={<Switch checked={publishedOnly} onChange={(e) => setPublishedOnly(e.target.checked)} />}
          label="רק מפורסמות"
        />
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>סדר</TableCell>
              <TableCell>שאלה</TableCell>
              <TableCell>מפורסם</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.id} hover>
                <TableCell>{f.displayOrder}</TableCell>
                <TableCell>{f.question}</TableCell>
                <TableCell>{f.isPublished ? "כן" : "לא"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/faqs/${f.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(f.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  אין שאלות להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}