
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RuleIcon from "@mui/icons-material/Rule";

import { usersService } from "../../services/usersService";
import { requestsService } from "../../services/requestsService";
import { coursesService } from "../../services/coursesService";
import { requirementsService } from "../../services/requirementsService";

type StatCardProps = {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function StatCard({ title, value, color, icon, onClick }: StatCardProps) {
  return (
    <Card sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <Box sx={{ height: 4, bgcolor: color }} />
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 12,
            bgcolor: color,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            {value}
          </Typography>
          <Button onClick={onClick} size="small" sx={{ mt: 0.5, px: 0 }}>
            מעבר למסך
          </Button>
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
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  function refresh() {
    setCandidatesCount(usersService.getCandidates().length);
    setCoursesCount(coursesService.getAll().length);
    setRequirementsCount(requirementsService.getAll().length);

    const pending = requestsService.getAll().filter((r: any) => r.status === "נשלחה");
    setPendingRequestsCount(pending.length);
  }

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "דרישות קבלה",
        value: requirementsCount,
        color: "#2EAD4A", // ירוק
        icon: <RuleIcon />,
        onClick: () => navigate("/admin/requirements"),
      },
      {
        title: "קורסים פעילים",
        value: coursesCount,
        color: "#6C63FF", // סגול
        icon: <MenuBookIcon />,
        onClick: () => navigate("/admin/courses"),
      },
      {
        title: "בקשות הרשמה",
        value: pendingRequestsCount,
        color: "#FF7A1A", // כתום
        icon: <AssignmentIcon />,
        onClick: () => navigate("/admin/requests"),
      },
      {
        title: "מועמדים",
        value: candidatesCount,
        color: "#1E88E5", // כחול
        icon: <PeopleIcon />,
        onClick: () => navigate("/admin/candidates"),
      },
    ],
    [requirementsCount, coursesCount, pendingRequestsCount, candidatesCount, navigate]
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        לוח בקרה – מערכת הניהול
      </Typography>
      <Typography sx={{ opacity: 0.75, mb: 2 }}>
        צפייה מהירה בסטטוס המערכת וקישורים לפעולות מרכזיות
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>בקשות הרשמה לטיפול</Typography>
          <Typography sx={{ opacity: 0.75 }}>
            כאן יוצג בהמשך טבלה/רשימה של בקשות בסטטוס “נשלחה”.
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>מועמדים אחרונים</Typography>
          <Typography sx={{ opacity: 0.75 }}>
            כאן יוצג בהמשך טבלה/רשימה של מועמדים שנוספו לאחרונה.
          </Typography>
        </Paper>
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Typography sx={{ fontWeight: 900 }}>פעולות מהירות</Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#2EAD4A" }}
          onClick={() => navigate("/admin/requirements/new")}
        >
          הוספת דרישה
        </Button>

        <Button
          variant="contained"
          sx={{ bgcolor: "#6C63FF" }}
          onClick={() => navigate("/admin/courses/new")}
        >
          הוספת קורס
        </Button>

        <Button
          variant="contained"
          sx={{ bgcolor: "#FF7A1A" }}
          onClick={() => navigate("/admin/requests/new")}
        >
          הוספת בקשה
        </Button>

        <Button
          variant="contained"
          sx={{ bgcolor: "#1E88E5" }}
          onClick={() => navigate("/admin/candidates/new")}
        >
          הוספת מועמד
        </Button>
      </Stack>
    </Box>
  );
}