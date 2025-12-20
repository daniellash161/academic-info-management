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
import type { RequirementType } from "../../models/requirement";
import { requirementsService } from "../../services/requirementsService";

export function RequirementsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RequirementType | "ALL">("ALL");
  const [refreshKey, setRefreshKey] = useState(0); // כדי לרענן אחרי מחיקה/עדכון
  const navigate = useNavigate();

  useEffect(() => {
    // נטען דרך service (הטבלה עצמה תשתמש ב-memo למטה)
  }, [refreshKey]);

  const types = requirementsService.types();

  const rows = useMemo(() => {
    return requirementsService.searchAndFilter(query, typeFilter);
  }, [query, typeFilter, refreshKey]);

  function onDelete(id: string) {
    requirementsService.remove(id);
    setRefreshKey((x) => x + 1);
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
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.minScore}</TableCell>
                <TableCell>{r.isMandatory ? "כן" : "לא"}</TableCell>
                <TableCell>{r.displayOrder}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/requirements/${r.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(r.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין דרישות במערכת
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}