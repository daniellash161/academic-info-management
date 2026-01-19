import { useEffect, useState } from "react";
import { Box, LinearProgress } from "@mui/material";
import { subscribeAuthSync } from "../pages/auth/auth";

export function AuthSync(props: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeAuthSync(() => setReady(true));
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return <>{props.children}</>;
}
