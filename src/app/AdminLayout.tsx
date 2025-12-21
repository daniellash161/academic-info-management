// src/app/AdminLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RuleIcon from "@mui/icons-material/Rule";
import QuizIcon from "@mui/icons-material/Quiz";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import EventIcon from "@mui/icons-material/Event";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AdminNav } from "../components/AdminNav";

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = useMemo(
    () => [
      { label: "בית", path: "/admin", icon: <DashboardIcon fontSize="small" /> },
      { label: "מועמדים", path: "/admin/candidates", icon: <PeopleIcon fontSize="small" /> },
      { label: "בקשות הרשמה", path: "/admin/requests", icon: <AssignmentIcon fontSize="small" /> },
      { label: "קורסים", path: "/admin/courses", icon: <MenuBookIcon fontSize="small" /> },
      { label: "דרישות קבלה", path: "/admin/requirements", icon: <RuleIcon fontSize="small" /> },
      { label: "שאלות נפוצות", path: "/admin/faqs", icon: <QuizIcon fontSize="small" /> },
      { label: "פניות", path: "/admin/contacts", icon: <ContactSupportIcon fontSize="small" /> },
      { label: "מועדי הרשמה", path: "/admin/deadlines", icon: <EventIcon fontSize="small" /> },
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
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            onClick={() => setNavOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <Typography
            sx={{ fontWeight: 900, cursor: "pointer", userSelect: "none" }}
            variant="h6"
            onClick={() => navigate("/admin")}
          >
            מערכת ניהול
          </Typography>

          <Box sx={{ flex: 1 }} />

          <IconButton onClick={logout} aria-label="logout" title="התנתקות">
            <LogoutIcon />
          </IconButton>
        </Toolbar>

        <Toolbar
          variant="dense"
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            gap: 1,
            pb: 1.5,
            pt: 0.5,
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
                  borderRadius: 999,
                  px: 2,
                  height: 40,
                  fontWeight: 900,
                  bgcolor: active ? "primary.main" : "transparent",
                  color: active ? "#fff" : "text.primary",
                  "& .MuiButton-startIcon": {
                    marginInlineStart: 0,
                    marginInlineEnd: "10px",
                  },
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