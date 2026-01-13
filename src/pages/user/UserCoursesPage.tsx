import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { Course } from "../../models/course";
import { coursesService } from "../../services/coursesService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function UserCoursesPage() {
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Course[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await coursesService.getAll();
        if (!alive) return;
        setRows(data);
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת קורסים");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [snackbar]);

  return (
    <Box>
      {loading && <LinearProgress />}

      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        קורסים
      </Typography>

      {rows.length === 0 && !loading ? (
        <Paper sx={{ p: 2 }}>
          <Typography>אין קורסים להצגה.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rows.map((c) => (
            <Paper key={c.code} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 900 }}>{c.name}</Typography>
              <Typography sx={{ opacity: 0.8 }}>
                קוד: {c.code} · סמסטר: {c.semester} · נק״ז: {c.credits}
              </Typography>
              {c.lecturer && (
                <Typography sx={{ opacity: 0.8 }}>
                  מרצה: {c.lecturer}
                </Typography>
              )}
              {c.prerequisites && c.prerequisites.length > 0 && (
                <Typography sx={{ opacity: 0.8 }}>
                  קורסי קדם: {c.prerequisites.join(", ")}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
