import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { useNavigate } from "react-router-dom";

import type { Requirement, RequirementType } from "../../models/requirement";
import { requirementsService } from "../../services/requirementsService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

type TabKey = "ALL" | RequirementType;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function sortByDisplayOrder(a: Requirement, b: Requirement) {
  return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
}

function typeLabel(t: RequirementType) {
  return t;
}

export function UserRequirementsPage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Requirement[]>([]);
  const [tab, setTab] = useState<TabKey>("ALL");

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = await withTimeout(
          requirementsService.getAll(),
          12000,
          "requirements"
        );
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        if (!alive) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת דרישות קבלה");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const out: Record<RequirementType, Requirement[]> = {
      פסיכומטרי: [],
      בגרות: [],
      אנגלית: [],
    };

    for (const r of items) out[r.type].push(r);
    (Object.keys(out) as RequirementType[]).forEach((k) => {
      out[k] = [...out[k]].sort(sortByDisplayOrder);
    });

    return out;
  }, [items]);

  const filtered = useMemo(() => {
    const list = tab === "ALL" ? items : grouped[tab] ?? [];
    return [...list].sort(sortByDisplayOrder);
  }, [items, grouped, tab]);

  const countAll = items.length;
  const countPsych = grouped["פסיכומטרי"].length;
  const countBagrut = grouped["בגרות"].length;
  const countEnglish = grouped["אנגלית"].length;

  return (
    <Box sx={{ pb: 5 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          mb: 2.5,
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolOutlinedIcon />
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              דרישות קבלה
            </Typography>
          </Stack>

          <Typography sx={{ opacity: 0.8 }}>
            כל המידע שצריך לדעת על תנאי הקבלה לתוכנית הלימודים
          </Typography>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 6,
          mb: 2.5,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
          <InfoOutlinedIcon />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, mb: 0.5 }}>מידע חשוב</Typography>
            <Typography sx={{ opacity: 0.85, lineHeight: 1.7 }}>
              על מנת להתחיל בתוכנית הלימודים, יש לעמוד בדרישות הקבלה הרלוונטיות.
              במידה ויש שאלות – אפשר ליצור קשר ונשמח לעזור.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: { xs: 1.25, md: 1.5 },
          borderRadius: 6,
          mb: 2.5,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              minHeight: 44,
              fontWeight: 900,
              borderRadius: 3,
              mx: 0.5,
            },
          }}
        >
          <Tab value="ALL" label={`הכל (${countAll})`} />
          <Tab value="פסיכומטרי" label={`פסיכומטרי (${countPsych})`} />
          <Tab value="בגרות" label={`בגרות (${countBagrut})`} />
          <Tab value="אנגלית" label={`אנגלית (${countEnglish})`} />
        </Tabs>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2.2, md: 3 },
          borderRadius: 6,
          mb: 3,
          minHeight: 220,
        }}
      >
        {filtered.length === 0 && !loading ? (
          <Stack
            spacing={1.2}
            alignItems="center"
            justifyContent="center"
            sx={{ py: 4 }}
          >
            <AssignmentTurnedInOutlinedIcon
              sx={{ fontSize: 44, opacity: 0.5 }}
            />
            <Typography sx={{ fontWeight: 900 }}>אין דרישות להצגה</Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((r) => (
              <Paper
                key={r.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 4,
                  minWidth: 0,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                      <Typography sx={{ fontWeight: 900 }}>
                        {r.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={typeLabel(r.type)}
                        variant="outlined"
                      />
                      <Chip size="small" label={`מינימום: ${r.minScore}`} />
                      <Chip
                        size="small"
                        label={r.isMandatory ? "חובה" : "רשות"}
                        color={r.isMandatory ? "warning" : "default"}
                        variant={r.isMandatory ? "filled" : "outlined"}
                      />
                    </Stack>

                    {(r.description || r.extraInfo) && (
                      <Typography
                        sx={{
                          opacity: 0.85,
                          mt: 0.8,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.7,
                        }}
                      >
                        {[r.description, r.extraInfo]
                          .filter(Boolean)
                          .join(" — ")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 6,
          background:
            "linear-gradient(90deg, rgba(132, 43, 187, 0.95) 0%, rgba(82, 97, 214, 0.92) 100%)",
          color: "common.white",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
              יש לך שאלות נוספות?
            </Typography>
            <Typography sx={{ opacity: 0.92 }}>
              אנחנו כאן כדי לעזור! אם יש משהו לא ברור, אפשר ליצור קשר או לעיין
              בשאלות נפוצות.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.2}>
            <Button
              variant="contained"
              onClick={() => navigate("/user/contact")}
              sx={{
                fontWeight: 900,
                bgcolor: "rgba(255,255,255,0.92)",
                color: "rgba(35,35,35,1)",
                borderRadius: 3,
                "&:hover": { bgcolor: "rgba(255,255,255,0.85)" },
              }}
            >
              צור קשר
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/user/help")}
              sx={{
                fontWeight: 900,
                borderColor: "rgba(255,255,255,0.55)",
                color: "common.white",
                borderRadius: 3,
                "&:hover": { borderColor: "rgba(255,255,255,0.85)" },
              }}
            >
              עמוד עזרה
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
