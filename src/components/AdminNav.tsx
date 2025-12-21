import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminNav({ open, onClose }: Props) {
  const navigate = useNavigate();

  function go(path: string) {
    navigate(path);
    onClose(); 
  }

  function logout() {
    localStorage.removeItem("csih_auth"); 
    go("/login");
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 280 }} role="presentation">
        <List>
          <ListItemButton onClick={() => go("/admin")}>
            <ListItemText primary="בית" />
          </ListItemButton>

          <ListItemButton onClick={() => go("/admin/candidates")}>
            <ListItemText primary="מועמדים" />
          </ListItemButton>

          <ListItemButton onClick={() => go("/admin/requests")}>
            <ListItemText primary="בקשות הרשמה" />
          </ListItemButton>

          <ListItemButton onClick={() => go("/admin/courses")}>
            <ListItemText primary="קורסים" />
          </ListItemButton>

          <ListItemButton onClick={() => go("/admin/requirements")}>
            <ListItemText primary="דרישות קבלה" />
          </ListItemButton>

         
          <ListItemButton onClick={() => go("/admin/announcements")}>
            <ListItemText primary="עדכונים" />
          </ListItemButton>

          
          <ListItemButton onClick={() => go("/admin/documents")}>
            <ListItemText primary="מסמכים" />
          </ListItemButton>

          <ListItemButton onClick={() => go("/admin/help")}>
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