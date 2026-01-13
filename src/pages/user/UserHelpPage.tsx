import { Box, Paper, Typography } from "@mui/material";

export function UserHelpPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        שאלות נפוצות
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ opacity: 0.85 }}>
          כאן נציג את השאלות הנפוצות למשתמש (נחבר ל-Firestore בשלב הבא).
        </Typography>
      </Paper>
    </Box>
  );
}
