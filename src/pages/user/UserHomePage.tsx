import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function UserHomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
        פורטל מועמדים
      </Typography>
      <Typography sx={{ opacity: 0.75, mb: 3 }}>
        מידע על קורסים, דרישות קבלה, מועדי הרשמה ושאלות נפוצות.
      </Typography>

      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 900, mb: 0.5 }}>קורסים</Typography>
          <Typography sx={{ opacity: 0.8, mb: 1 }}>
            צפייה בקורסים פעילים ומידע בסיסי על כל קורס.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/app/courses")}>
            מעבר לקורסים
          </Button>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 900, mb: 0.5 }}>דרישות קבלה</Typography>
          <Typography sx={{ opacity: 0.8, mb: 1 }}>
            דרישות כגון פסיכומטרי, אנגלית ועוד.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/app/requirements")}
          >
            מעבר לדרישות
          </Button>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 900, mb: 0.5 }}>צור קשר</Typography>
          <Typography sx={{ opacity: 0.8, mb: 1 }}>
            שליחת פנייה למנהל מערכת/מזכירות.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/app/contact")}>
            מעבר לצור קשר
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}
