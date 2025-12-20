import { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { usersService } from "../../services/usersService";

export function CandidatesPage() {
  const [rows, setRows] = useState<User[]>([]);
  const navigate = useNavigate();

  function refresh() {
    setRows(usersService.getCandidates());
  }

  useEffect(() => {
    refresh(); // טעינה מה-LocalStorage
  }, []);

  function onDelete(id: string) {
    usersService.remove(id);
    refresh();
  }

  return (
    <Box>
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
              <TableRow key={u.id}>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.nationalId}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.interest ?? "-"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/admin/candidates/${u.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(u.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין מועמדים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}