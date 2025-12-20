import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Header } from "../components/Header";

export function AdminLayout() {
  return (
    <Box>
      <Header />
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}