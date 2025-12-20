import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { usersService } from "../../services/usersService";
import { requestsService } from "../../services/requestsService";
import { coursesService } from "../../services/coursesService";
import { requirementsService } from "../../services/requirementsService";

type PendingRequestRow = {
  requestNumber: number;
  candidateName: string;
  status: string;
  createdAt: string;
};

export function AdminHomePage() {
  const navigate = useNavigate();

  const [candidatesCount, setCandidatesCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [requirementsCount, setRequirementsCount] = useState(0);

  const [pendingRequests, setPendingRequests] = useState<PendingRequestRow[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<{ id: string; fullName: string; createdAt: string }[]>([]);

  function refresh() {
    // מועמדים
    const candidates = usersService.getCandidates();
    setCandidatesCount(candidates.length);

    // קורסים
    const courses = coursesService.getAll();
    setCoursesCount(courses.length);

    // דרישות קבלה
    const reqs = requirementsService.getAll();
    setRequirementsCount(reqs.length);

    // בקשות הרשמה
    const allRequests = requestsService.getAll();

    // "ממתינות": כדי להיות עמידים לשמות סטטוס שונים (מהתכנון/מהקוד),
    // נחשב כממתינות כל מה ש"נשלחה" או "בהמתנה" (אם קיימים).
    const pendingStatusSet = new Set(["נשלחה", "בהמתנה"]);

    const pending = allRequests
      .filter((r: any) => pendingStatusSet.has(r.status))
      .slice(0, 5)
      .map((r: any) => {
        const cand = usersService.getById(r.candidateId);
        return {
          requestNumber: r.requestNumber,
          candidateName: cand?.fullName ?? "(מועמד לא נמצא)",
          status: r.status,
          createdAt: r.createdAt,
        };
      });

    setPendingRequests(pending);

    // מועמדים אחרונים (5 אחרונים)
    const recent = [...candidates]
      .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 5)
      .map((c: any) => ({ id: c.id, fullName: c.fullName, createdAt: c.createdAt }));

    setRecentCandidates(recent);
  }

  useEffect(() => {
    refresh(); // טעינה ראשונית (כמו בשאר מסכי הניהול)
  }, []);

  const pendingCount = useMemo(() => pendingRequests.length, [pendingRequests]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        מסך בית – מנהל מערכת
      </Typography>

      {/* סיכומים מספריים */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline">כמות מועמדים</Typography>
            <Typography variant="h4">{candidatesCount}</Typography>
            <Button sx={{ mt: 1 }} onClick={() => navigate("/admin/candidates")}>
              מעבר לניהול מועמדים
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline">בקשות ממתינות</Typography>
            <Typography variant="h4">{pendingCount}</Typography>
            <Button sx={{ mt: 1 }} onClick={() => navigate("/admin/requests")}>
              מעבר לניהול בקשות
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline">כמות קורסים פעילים</Typography>
            <Typography variant="h4">{coursesCount}</Typography>
            <Button sx={{ mt: 1 }} onClick={() => navigate("/admin/courses")}>
              מעבר לניהול קורסים
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline">כמות דרישות קבלה</Typography>
            <Typography variant="h4">{requirementsCount}</Typography>
            <Button sx={{ mt: 1 }} onClick={() => navigate("/admin/requirements")}>
              מעבר לדרישות קבלה
            </Button>
          </CardContent>
        </Card>
      </Stack>

      {/* כפתורי גישה מהירה */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          גישה מהירה
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="contained" onClick={() => navigate("/admin/candidates/new")}>
            הוספת מועמד חדש
          </Button>
          <Button variant="contained" onClick={() => navigate("/admin/requests/new")}>
            הוספת בקשת הרשמה
          </Button>
          <Button variant="contained" onClick={() => navigate("/admin/courses/new")}>
            הוספת קורס חדש
          </Button>
          <Button variant="contained" onClick={() => navigate("/admin/requirements/new")}>
            הוספת דרישת קבלה
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* בקשות ממתינות */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            בקשות ממתינות לטיפול
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {pendingRequests.length === 0 ? (
            <Typography>אין בקשות ממתינות 🎉</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>מס׳ בקשה</TableCell>
                  <TableCell>מועמד</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell align="right">פעולה</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((r) => (
                  <TableRow key={r.requestNumber} hover>
                    <TableCell>{r.requestNumber}</TableCell>
                    <TableCell>{r.candidateName}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.createdAt}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => navigate(`/admin/requests/${r.requestNumber}/edit`)}
                      >
                        עריכה
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* מועמדים אחרונים */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            מועמדים אחרונים שנוספו
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {recentCandidates.length === 0 ? (
            <Typography>אין מועמדים במערכת</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>שם מלא</TableCell>
                  <TableCell>נוצר בתאריך</TableCell>
                  <TableCell align="right">פעולה</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentCandidates.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.fullName}</TableCell>
                    <TableCell>{String(c.createdAt).slice(0, 10)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/admin/candidates/${c.id}/edit`)}>
                        עריכה
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}