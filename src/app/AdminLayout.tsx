import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { useState } from "react";
import { Header } from "../components/Header";
import { AdminNav } from "../components/AdminNav";

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <Box>
      <Header onOpenNav={() => setNavOpen(true)} />
      <AdminNav open={navOpen} onClose={() => setNavOpen(false)} />

      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}