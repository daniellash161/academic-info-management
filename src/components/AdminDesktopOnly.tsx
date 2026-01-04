import type { PropsWithChildren } from "react";
import { Box, Typography } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";

type Props = PropsWithChildren<{
  minWidthBreakpoint?: "sm" | "md" | "lg";
}>;

export function AdminDesktopOnly({ children, minWidthBreakpoint = "md" }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(minWidthBreakpoint));

  if (isMobile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Admin screens are available on desktop only
        </Typography>
        <Typography variant="body1">
          Please open this page on a wider screen (desktop / laptop).
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}