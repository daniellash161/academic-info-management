// src/app/AdminLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RuleIcon from "@mui/icons-material/Rule";
import CampaignIcon from "@mui/icons-material/Campaign";
import DescriptionIcon from "@mui/icons-material/Description";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useMemo, useState } from "react";
import { AdminNav } from "../components/AdminNav";

type TopNavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items: TopNavItem[] = useMemo(
    () => [
      { label: "בית", path: "/admin", icon: <DashboardIcon fontSize="small" /> },
      { label: "מועמדים", path: "/admin/candidates", icon: <PeopleIcon fontSize="small" /> },
      { label: "קורסים", path: "/admin/courses", icon: <MenuBookIcon fontSize="small" /> },
      { label: "בקשות הרשמה", path: "/admin/requests", icon: <AssignmentIcon fontSize="small" /> },
      { label: "דרישות קבלה", path: "/admin/requirements", icon: <RuleIcon fontSize="small" /> },
      { label: "עדכונים", path: "/admin/announcements", icon: <CampaignIcon fontSize="small" /> },
      { label: "מסמכים", path: "/admin/documents", icon: <DescriptionIcon fontSize="small" /> },
      { label: "עזרה", path: "/admin/help", icon: <HelpOutlineIcon fontSize="small" /> },
    ],
    []
  );

  function isActive(path: string) {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  function logout() {
    localStorage.removeItem("csih_auth");
    navigate("/login", { replace: true });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={() => setNavOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" } }}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 1 }}
            onClick={() => navigate("/admin")}
          >
            מערכת ניהול
          </Typography>

          <Box sx={{ flex: 1 }} />

          <IconButton onClick={logout} title="התנתקות">
            <LogoutIcon />
          </IconButton>
        </Toolbar>

        {/* Top nav like in wireframe (desktop) */}
        <Toolbar
          variant="dense"
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 1,
            flexWrap: "wrap",
            pb: 1,
          }}
        >
          {items.map((it) => {
            const active = isActive(it.path);
            return (
              <Button
                key={it.path}
                onClick={() => navigate(it.path)}
                startIcon={it.icon}
                variant={active ? "contained" : "text"}
                color={active ? "primary" : "inherit"}
                sx={{
                  bgcolor: active ? "primary.main" : "transparent",
                  color: active ? "#fff" : "text.primary",
                }}
              >
                {it.label}
              </Button>
            );
          })}
        </Toolbar>
      </AppBar>

      <AdminNav open={navOpen} onClose={() => setNavOpen(false)} />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}