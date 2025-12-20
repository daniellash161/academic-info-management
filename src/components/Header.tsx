import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

export function Header(props: { onOpenNav: () => void }) {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={props.onOpenNav}
          sx={{ mr: 2 }}
          aria-label="open navigation"
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/admin")}
        >
          Academic Info Manager
        </Typography>
      </Toolbar>
    </AppBar>
  );
}