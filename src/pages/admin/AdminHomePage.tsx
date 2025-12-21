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
import type { ReactNode } from "react";

import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RuleIcon from "@mui/icons-material/Rule";

import { usersService } from "../../services/usersService";
import { requestsService } from "../../services/requestsService";
import { coursesService } from "../../services/coursesService";
import { requirementsService } from "../../services/requirementsService";
import { contactMessagesService } from "../../services/contactMessagesService";
import type { ContactMessage } from "../../models/contactMessage";

type StatCardProps = {
  title: string;
  value: number;
  color: string;
  icon: ReactNode;
  onClick: () => void;
};

function StatCard({ title, value, color, icon, onClick }: StatCardProps) {
  return (
    <Card
      sx={{
        flex: "1 1 320px", // ✅ חשוב: נותן מקום + מאפשר wrap + gap
        position: "relative",
        overflow: "hidden",
        minWidth: 280,
      }}
    >
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

export function AdminHomePage() {
  const navigate = useNavigate();

  const [candidatesCount, setCandidatesCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [requirementsCount, setRequirementsCount] = useState(0);

  const [pendingRequests, setPendingRequests] = useState<
    { requestNumber: number; candidateName: string; status: string; createdAt: string }[]
  >([]);

  const [recentContacts, setRecentContacts] = useState<
    { id: string; createdAt: string; fullName: string; subject: string; status: string }[]
  >([]);

  function refresh() {
    const candidates = usersService.getCandidates();
    setCandidatesCount(candidates.length);
    setCoursesCount(coursesService.getAll().length);
    setRequirementsCount(requirementsService.getAll().length);

    const pending = requestsService
      .getAll()
      .filter((r: any) => r.status === "נשלחה")
      .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)))
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

    const contacts = contactMessagesService.getAll();
    const recent = [...contacts]
      .sort((a: ContactMessage, b: ContactMessage) =>
        String(b.createdAt).localeCompare(String(a.createdAt))
      )
      .slice(0, 5)
      .map((m: ContactMessage) => ({
        id: m.id,
        createdAt: String(m.createdAt).slice(0, 10),
        fullName: m.fullName,
        subject: m.subject,
        status: m.status,
      }));

    setRecentContacts(recent);
  }

  useEffect(() => {
    refresh();
  }, []);

  const pendingCount = useMemo(() => {
    return requestsService.getAll().filter((r: any) => r.status === "נשלחה").length;
  }, []);

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
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
        לוח בקרה – מערכת הניהול
      </Typography>
      <Typography sx={{ opacity: 0.7, mb: 3 }}>
        צפייה מהירה בסטטוס המערכת וקישורים לפעולות מרכזיות
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} useFlexGap sx={{ mb: 3, alignItems: "stretch" }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: { xs: "100%", md: 520 } }}>
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

        <Paper sx={{ p: 2, flex: 1, minWidth: { xs: "100%", md: 520 } }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>פניות אחרונות (צור קשר)</Typography>
          <Divider sx={{ mb: 2 }} />

          {recentContacts.length === 0 ? (
            <Typography sx={{ opacity: 0.75 }}>אין פניות במערכת.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>שם</TableCell>
                  <TableCell>נושא</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell align="left">פעולה</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentContacts.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.fullName}</TableCell>
                    <TableCell>{m.subject}</TableCell>
                    <TableCell>{m.status}</TableCell>
                    <TableCell>{m.createdAt}</TableCell>
                    <TableCell align="left">
                      <Button
                        size="small"
                        sx={{ fontWeight: 900 }}
                        onClick={() => navigate(`/admin/contacts/${m.id}/edit`)}
                      >
                        מעבר לפנייה
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button size="small" onClick={() => navigate("/admin/contacts")} sx={{ fontWeight: 900 }}>
              לכל הפניות
            </Button>
          </Box>
        </Paper>
      </Stack>

      <Typography sx={{ fontWeight: 900, mb: 1 }}>פעולות מהירות</Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button variant="contained" sx={{ bgcolor: "#22C55E" }} onClick={() => navigate("/admin/requirements/new")}>
          הוספת דרישה
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#6C63FF" }} onClick={() => navigate("/admin/courses/new")}>
          הוספת קורס
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#F97316" }} onClick={() => navigate("/admin/requests/new")}>
          הוספת בקשה
        </Button>
        <Button variant="contained" sx={{ bgcolor: "#3B82F6" }} onClick={() => navigate("/admin/candidates/new")}>
          הוספת מועמד
        </Button>
      </Box>
    </Box>
  );
}