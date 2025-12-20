import { Snackbar, Alert } from "@mui/material";

export function AppSnackbar(props: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Snackbar open={props.open} autoHideDuration={2500} onClose={props.onClose}>
      <Alert onClose={props.onClose} severity="success" variant="filled">
        {props.message}
      </Alert>
    </Snackbar>
  );
}