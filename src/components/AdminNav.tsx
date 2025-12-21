
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AUTH_KEY = "csih_auth"; 
export function AdminNav({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  function go(path: string) {
    navigate(path);
    onClose();
  }

  function isActive(path: string) {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    go("/login");
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 280 }} role="presentation">
        <List>
          <ListItemButton selected={isActive("/admin")} onClick={() => go("/admin")}>
            <ListItemText primary="בית" />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/admin/candidates")}
            onClick={() => go("/admin/candidates")}
          >
            <ListItemText primary="מועמדים" />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/admin/requests")}
            onClick={() => go("/admin/requests")}
          >
            <ListItemText primary="בקשות הרשמה" />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/admin/courses")}
            onClick={() => go("/admin/courses")}
          >
            <ListItemText primary="קורסים" />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/admin/requirements")}
            onClick={() => go("/admin/requirements")}
          >
            <ListItemText primary="דרישות קבלה" />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/admin/announcements")}
            onClick={() => go("/admin/announcements")}
          >
            <ListItemText primary="עדכונים" />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/admin/documents")}
            onClick={() => go("/admin/documents")}
          >
            <ListItemText primary="מסמכים" />
          </ListItemButton>

          <ListItemButton selected={isActive("/admin/help")} onClick={() => go("/admin/help")}>
            <ListItemText primary="עזרה" />
          </ListItemButton>
        </List>

        <Divider />

        <List>
          <ListItemButton onClick={logout}>
            <ListItemText primary="התנתקות" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}