import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useMemo, useState } from "react";

type NavItem = {
  label: string;
  path: string;
};

const drawerWidth = 260;

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = useMemo(
    () => [
      { label: "מסך בית", path: "/admin" },
      { label: "מועמדים", path: "/admin/candidates" },
      { label: "בקשות הרשמה", path: "/admin/requests" },
      { label: "קורסים", path: "/admin/courses" },
      { label: "דרישות קבלה", path: "/admin/requirements" },

      { label: "עדכונים", path: "/admin/announcements" },
      { label: "מסמכים", path: "/admin/documents" },

      { label: "עזרה", path: "/admin/help" },
    ],
    []
  );

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">תפריט</Typography>
        </Box>
        <Divider />
        <List>
          {items.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}