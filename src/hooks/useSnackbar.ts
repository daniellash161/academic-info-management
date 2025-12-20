import { useState } from "react";

export function useSnackbar() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  function show(msg: string) {
    setMessage(msg);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return { open, message, show, close };
}