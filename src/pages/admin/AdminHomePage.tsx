import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RuleIcon from "@mui/icons-material/Rule";

import { usersService } from "../../services/usersService";
import { requestsService } from "../../services/requestsService";
import { coursesService } from "../../services/coursesService";
import { requirementsService } from "../../services/requirementsService";
import type { RegistrationRequest } from "../../models/registrationRequest";
import type { User } from "../../models/user";

import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type StatCardProps = {
  title: string;
  value: number;
  color: string;
  icon: ReactNode;
  onClick: () => void;
};

function StatCard({ title, value, color, icon, onClick }: StatCardProps) {
  return (
    <Card sx={{ flex: "1 1 260px", minWidth: 260, position: "relative", overflow: "hidden" }}>
      <Box sx={{ height: 4, bgcolor: color }} />
      <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontWeight: 900, opacity: 0.75 }}>{title}</Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1, my: 0.5 }}>
            {value}
          </Typography>
          <Button onClick={onClick} size="small" sx={{ px: 0, fontWeight: 900 }}>
            מעבר למסך
          </Button>
        </Box>

        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 999,
            bgcolor: color,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

type PendingRow = {
  requestNumber: number;
  candidateName: string;
  status: string;
  createdAt: string;
};

type RecentCandidateRow = {
  id: string;
  fullName: string;
  createdAt: string;
};

export function AdminHomePage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);

  const [candidatesCount, setCandidatesCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [requirementsCount, setRequirementsCount] = useState(0);

  const [requests, setRequests] = useState<RegistrationRequest[]>([]);

  const [pendingRequests, setPendingRequests] = useState<PendingRow[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidateRow[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const [candidates, courses, requirements, allRequests] = await Promise.all([
        usersService.getCandidates(),
        coursesService.getAll(),
        requirementsService.getAll(),
        requestsService.getAll(),
      ]);

      setCandidatesCount(candidates.length);
      setCoursesCount(courses.length);
      setRequirementsCount(requirements.length);

      setRequests(allRequests);

      const candidatesById: Record<string, User> = {};
      for (const c of candidates) candidatesById[c.id] = c;

      const pendingTop = [...allRequests]
        .filter((r) => r.status === "נשלחה")
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5)
        .map((r) => {
          const cand = candidatesById[r.candidateId];
          return {
            requestNumber: r.requestNumber,
            candidateName: cand?.fullName ?? "(מועמד לא נמצא)",
            status: r.status,
            createdAt: r.createdAt,
          };
        });

      setPendingRequests(pendingTop);

      const recent = [...candidates]
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          fullName: c.fullName,
          createdAt: String(c.createdAt).slice(0, 10),
        }));

      setRecentCandidates(recent);
    } catch (e: any) {
      snackbar.show(e?.message ?? "שגיאה בטעינת נתונים (בדקי חיבור Firebase / הרשאות)");
      setCandidatesCount(0);
      setCoursesCount(0);
      setRequirementsCount(0);
      setRequests([]);
      setPendingRequests([]);
      setRecentCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const pendingCount = useMemo(() => {
    return requests.filter((r) => r.status === "נשלחה").length;
  }, [requests]);

  const stats = useMemo(
    () => [
      {
        title: "מועמדים",
        value: candidatesCount,
        color: "#3B82F6",
        icon: <PeopleIcon />,
        onClick: () => navigate("/admin/candidates"),
      },
      {
        title: "בקשות הרשמה",
        value: pendingCount,
        color: "#F97316",
        icon: <AssignmentIcon />,
        onClick: () => navigate("/admin/requests"),
      },
      {
        title: "קורסים פעילים",
        value: coursesCount,
        color: "#6C63FF",
        icon: <MenuBookIcon />,
        onClick: () => navigate("/admin/courses"),
      },
      {
        title: "דרישות קבלה",
        value: requirementsCount,
        color: "#22C55E",
        icon: <RuleIcon />,
        onClick: () => navigate("/admin/requirements"),
      },
    ],
    [candidatesCount, pendingCount, coursesCount, requirementsCount, navigate]
  );

  return (
    <Box>
      {loading && <LinearProgress />}

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
        לוח בקרה – מערכת הניהול
      </Typography>
      <Typography sx={{ opacity: 0.7, mb: 3 }}>
        צפייה מהירה בסטטוס המערכת וקישורים לפעולות מרכזיות
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Paper sx={{ p: 2, flex: "1 1 520px", minWidth: 520 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>בקשות הרשמה לטיפול</Typography>
          <Divider sx={{ mb: 2 }} />

          {pendingRequests.length === 0 ? (
            <Typography sx={{ opacity: 0.75 }}>אין בקשות בסטטוס “נשלחה”.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>מס׳ בקשה</TableCell>
                  <TableCell>מועמד</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell align="left">פעולה</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((r) => (
                  <TableRow key={r.requestNumber} hover>
                    <TableCell>{r.requestNumber}</TableCell>
                    <TableCell>{r.candidateName}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.createdAt}</TableCell>
                    <TableCell align="left">
                      <Button
                        size="small"
                        sx={{ fontWeight: 900 }}
                        onClick={() => navigate(`/admin/requests/${r.requestNumber}/edit`)}
                      >
                        מעבר לבקשה
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper sx={{ p: 2, flex: "1 1 520px", minWidth: 520 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>מועמדים אחרונים</Typography>
          <Divider sx={{ mb: 2 }} />

          {recentCandidates.length === 0 ? (
            <Typography sx={{ opacity: 0.75 }}>אין מועמדים במערכת.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>שם</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell align="left">פעולה</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentCandidates.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.fullName}</TableCell>
                    <TableCell>{c.createdAt}</TableCell>
                    <TableCell align="left">
                      <Button
                        size="small"
                        sx={{ fontWeight: 900 }}
                        onClick={() => navigate(`/admin/candidates/${c.id}/edit`)}
                      >
                        מעבר למועמד
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      <Typography sx={{ fontWeight: 900, mb: 1 }}>פעולות מהירות</Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button variant="contained" sx={{ bgcolor: "#22C55E" }} onClick={() => navigate("/admin/requirements/new")}>
          הוספת דרישה
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#6C63FF" }} onClick={() => navigate("/admin/courses/new")}>
          הוספת קורס
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#8B5CF6" }} onClick={() => navigate("/admin/deadlines/new")}>
          הוספת מועד הרשמה
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#F97316" }} onClick={() => navigate("/admin/requests/new")}>
          הוספת בקשה
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#3B82F6" }} onClick={() => navigate("/admin/candidates/new")}>
          הוספת מועמד
        </Button>
      </Box>

      <AppSnackbar open={snackbar.open} message={snackbar.message} onClose={snackbar.close} />
    </Box>
  );
}