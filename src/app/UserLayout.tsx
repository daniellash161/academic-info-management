import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

export function UserLayout() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography sx={{ fontWeight: 900 }}>
                הקריה האקדמית אונו
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ "& a": { textDecoration: "none" } }}
              >
                <Button component={NavLink} to="." end variant="text">
                  בית
                </Button>
                <Button component={NavLink} to="courses" variant="text">
                  קורסים
                </Button>
                <Button component={NavLink} to="requirements" variant="text">
                  דרישות קבלה
                </Button>
                <Button component={NavLink} to="help" variant="text">
                  שאלות נפוצות
                </Button>
                <Button component={NavLink} to="contact" variant="text">
                  צור קשר
                </Button>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate("/login")}>
                כניסה
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
