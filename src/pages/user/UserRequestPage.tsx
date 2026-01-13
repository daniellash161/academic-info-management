import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { requirementsService } from "../../services/requirementsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function UserRequirementsPage() {
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await requirementsService.getAll();
        if (!alive) return;
        setRows(data);
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת דרישות");
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
        דרישות קבלה
      </Typography>

      {rows.length === 0 && !loading ? (
        <Paper sx={{ p: 2 }}>
          <Typography>אין דרישות להצגה.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rows.map((r: any) => (
            <Paper key={r.id} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 900 }}>
                {r.title ?? "דרישה"}
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                סוג: {r.type ?? "-"} · מינימום: {r.minScore ?? "-"}
              </Typography>
              {Array.isArray(r.courseCodes) && r.courseCodes.length > 0 && (
                <Typography sx={{ opacity: 0.8 }}>
                  קורסים רלוונטיים: {r.courseCodes.join(", ")}
                </Typography>import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { requirementsService } from "../../services/requirementsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

export function UserRequirementsPage() {
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await requirementsService.getAll();
        if (!alive) return;
        setRows(data);
      } catch (e: any) {
        snackbar.show(e?.message ?? "שגיאה בטעינת דרישות");
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
        דרישות קבלה
      </Typography>

      {rows.length === 0 && !loading ? (
        <Paper sx={{ p: 2 }}>
          <Typography>אין דרישות להצגה.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rows.map((r: any) => (
            <Paper key={r.id} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 900 }}>
                {r.title ?? "דרישה"}
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                סוג: {r.type ?? "-"} · מינימום: {r.minScore ?? "-"}
              </Typography>
              {Array.isArray(r.courseCodes) && r.courseCodes.length > 0 && (
                <Typography sx={{ opacity: 0.8 }}>
                  קורסים רלוונטיים: {r.courseCodes.join(", ")}
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
