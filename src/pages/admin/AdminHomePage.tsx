import { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { usersService } from "../../services/usersService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

function toArray<T>(x: unknown): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

export function AdminHomePage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<User[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const candsRaw = await usersService.getCandidates();
      setCandidates(toArray<User>(candsRaw));
    } catch (e: any) {
      setCandidates([]);
      snackbar.show(e?.message ?? "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const candidatesCount = useMemo(() => candidates.length, [candidates]);

  return (
    <Box>
      {loading && <LinearProgress />}

      <Typography variant="h5" sx={{ mb: 2 }}>
        דף ניהול
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 700 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              סיכום
            </Typography>
            <Typography>מועמדים במערכת: {candidatesCount}</Typography>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" onClick={() => navigate("/admin/candidates")}>
            ניהול מועמדים
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/requests")}>
            ניהול בקשות הרשמה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/courses")}>
            ניהול קורסים
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/requirements")}>
            ניהול דרישות קבלה
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/faqs")}>
            ניהול שאלות נפוצות
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/contacts")}>
            ניהול פניות צור קשר
          </Button>
        </Stack>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}