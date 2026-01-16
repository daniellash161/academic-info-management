import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useContext } from "react";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { ColorModeContext } from "./ColorModeProvider";

export function UserLayout() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const { toggle } = useContext(ColorModeContext);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 1, md: 2 } }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  sx={{
                    fontWeight: 900,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => navigate("/user")}
                >
                  הקריה האקדמית אונו
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    "& a": { textDecoration: "none" },
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                  }}
                >
                  <Button component={NavLink} to="/user" end variant="text">
                    בית
                  </Button>
                  <Button component={NavLink} to="/user/courses" variant="text">
                    קורסים
                  </Button>
                  <Button
                    component={NavLink}
                    to="/user/requirements"
                    variant="text"
                  >
                    דרישות קבלה
                  </Button>
                  <Button component={NavLink} to="/user/help" variant="text">
                    עזרה
                  </Button>
                  <Button component={NavLink} to="/user/contact" variant="text">
                    צור קשר
                  </Button>
                  <Button
                    component={NavLink}
                    to="/user/request"
                    variant="text"
                    sx={{ fontWeight: 900 }}
                  >
                    הגשת בקשת הרשמה
                  </Button>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={toggle}
                  aria-label="toggle theme"
                  title="Theme"
                >
                  {muiTheme.palette.mode === "dark" ? (
                    <LightModeIcon />
                  ) : (
                    <DarkModeIcon />
                  )}
                </IconButton>

                <Button variant="outlined" onClick={() => navigate("/login")}>
                  מעבר למנהל
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {!isDesktop ? (
          <Box sx={{ maxWidth: 720, mx: "auto" }}>
            <Alert severity="info">מסכי משתמש זמינים בדסקטופ בלבד.</Alert>
          </Box>
        ) : (
          <Outlet />
        )}
      </Container>
    </Box>
  );
}
