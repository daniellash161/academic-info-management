import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Alert, Snackbar } from "@mui/material";

type SnackState = { open: boolean; message: string };

let state: SnackState = { open: false, message: "" };
const listeners = new Set<(s: SnackState) => void>();

let hostRoot: ReactDOM.Root | null = null;
let hostSetState: ((s: SnackState) => void) | null = null;

function emit(next: SnackState) {
  state = next;
  listeners.forEach((fn) => fn(state));
  if (hostSetState) hostSetState(state);
}

function ensureHostMounted() {
  if (hostRoot) return;

  const id = "__global_snackbar_host__";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
  }

  hostRoot = ReactDOM.createRoot(el);

  function GlobalSnackbarHost() {
    const [s, setS] = useState<SnackState>(state);

    useEffect(() => {
      hostSetState = setS;
      setS(state);
      return () => {
        if (hostSetState === setS) hostSetState = null;
      };
    }, []);

    return React.createElement(
      Snackbar,
      {
        open: s.open,
        autoHideDuration: 2500,
        onClose: () => emit({ ...state, open: false }),
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      },
      React.createElement(
        Alert,
        {
          onClose: () => emit({ ...state, open: false }),
          severity: "success",
          variant: "filled",
          sx: { width: "100%" },
        },
        s.message
      )
    );
  }

  hostRoot.render(React.createElement(GlobalSnackbarHost));
}

export function useSnackbar() {
  const [local, setLocal] = useState<SnackState>(state);

  useEffect(() => {
    const fn = (s: SnackState) => setLocal(s);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  function show(msg: string) {
    ensureHostMounted();
    emit({ open: true, message: msg });
  }

  function close() {
    emit({ ...state, open: false });
  }

  return { open: local.open, message: local.message, show, close };
}