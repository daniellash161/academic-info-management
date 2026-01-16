import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useNavigate } from "react-router-dom";

import type { Course } from "../../models/course";
import type { Requirement, RequirementType } from "../../models/requirement";
import type { RegistrationDeadline } from "../../models/registrationDeadline";

import { coursesService } from "../../services/coursesService";
import { requirementsService } from "../../services/requirementsService";
import { registrationDeadlinesService } from "../../services/registrationDeadlinesService";

import { useSnackbar } from "../../hooks/useSnackbar";
import { AppSnackbar } from "../../components/AppSnackbar";

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

function sortIsoAsc(a?: string, b?: string) {
  return String(a ?? "").localeCompare(String(b ?? ""));
}

function groupRequirements(items: Requirement[]) {
  const out: Record<RequirementType, Requirement[]> = {
    פסיכומטרי: [],
    בגרות: [],
    אנגלית: [],
  };

  for (const r of items) out[r.type].push(r);

  (Object.keys(out) as RequirementType[]).forEach((k) => {
    out[k] = [...out[k]].sort((x, y) => x.displayOrder - y.displayOrder);
  });

  return out;
}

type FitState = {
  psychometric: string;
  bagrutAvg: string;
  english: string;
};

function n(v: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : NaN;
}

export function UserHomePage() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [deadlines, setDeadlines] = useState<RegistrationDeadline[]>([]);

  const [fit, setFit] = useState<FitState>({
    psychometric: "",
    bagrutAvg: "",
    english: "",
  });

  const reqByType = useMemo(
    () => groupRequirements(requirements),
    [requirements]
  );

  const activeDeadlines = useMemo(() => {
    return [...deadlines]
      .filter((d) => d.isActive)
      .sort((a, b) => sortIsoAsc(a.startDate, b.startDate))
      .slice(0, 4);
  }, [deadlines]);

  const sampleCourses = useMemo(() => {
    return [...courses].slice(0, 1);
  }, [courses]);

  const fitResult = useMemo(() => {
    const p = n(fit.psychometric);
    const b = n(fit.bagrutAvg);
    const e = n(fit.english);

    const psychMin = reqByType["פסיכומטרי"]?.[0]?.minScore;
    const bagrutMin = reqByType["בגרות"]?.[0]?.minScore;
    const engMin = reqByType["אנגלית"]?.[0]?.minScore;

    const psychOk =
      Number.isFinite(p) && psychMin !== undefined ? p >= psychMin : null;
    const bagrutOk =
      Number.isFinite(b) && bagrutMin !== undefined ? b >= bagrutMin : null;
    const engOk =
      Number.isFinite(e) && engMin !== undefined ? e >= engMin : null;

    const anyEntered = fit.psychometric || fit.bagrutAvg || fit.english;
    return {
      anyEntered,
      psychOk,
      bagrutOk,
      engOk,
      psychMin,
      bagrutMin,
      engMin,
    };
  }, [fit, reqByType]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const [c, r, d] = await Promise.all([
          withTimeout(coursesService.getAll(), 12000, "courses"),
          withTimeout(requirementsService.getAll(), 12000, "requirements"),
          withTimeout(
            registrationDeadlinesService.getAll(),
            12000,
            "deadlines"
          ),
        ]);
        if (!alive) return;
        setCourses(c);
        setRequirements(r);
        setDeadlines(d);
      } catch (e: any) {
        if (!alive) return;
        snackbar.show(e?.message ?? "שגיאה בטעינת נתונים");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, []);

  const heroSx = {
    borderRadius: 10,
    p: { xs: 3, md: 5 },
    overflow: "hidden",
    background:
      "linear-gradient(90deg, rgba(132, 43, 187, 0.95) 0%, rgba(82, 97, 214, 0.92) 100%)",
    color: "common.white",
  } as const;

  const heroPillSx = {
    bgcolor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 999,
    px: 2,
    py: 1.2,
    display: "flex",
    alignItems: "center",
    gap: 1.2,
    minWidth: 0,
  } as const;

  const cardSx = {
    p: { xs: 2.2, md: 2.8 },
    borderRadius: 6,
    minWidth: 0,
  } as const;

  return (
    <Box sx={{ pb: 5 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={heroSx}>
        <Stack spacing={2.2}>
          <Stack spacing={0.8}>
            <Typography
              sx={{
                fontWeight: 900,
                lineHeight: 1.05,
                fontSize: { xs: 34, md: 56 },
              }}
            >
              תוכנית מדעי המחשב
            </Typography>

            <Typography
              sx={{
                opacity: 0.92,
                maxWidth: 860,
                fontSize: { xs: 14.5, md: 16 },
              }}
            >
              צפייה בדרישות קבלה, מועדי הרשמה וקורסים — וחיפוש מהיר בכל המידע
              במקום אחד.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: { md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.2} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/user/requirements")}
                disabled={loading}
                sx={{
                  bgcolor: "rgba(255,255,255,0.92)",
                  color: "rgba(35,35,35,1)",
                  fontWeight: 900,
                  borderRadius: 3,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.85)" },
                }}
              >
                דרישות קבלה
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/user/request")}
                disabled={loading}
                startIcon={<SendOutlinedIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.55)",
                  color: "common.white",
                  fontWeight: 900,
                  borderRadius: 3,
                  "&:hover": { borderColor: "rgba(255,255,255,0.8)" },
                }}
              >
                הגשת בקשת הרשמה
              </Button>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.2,
                width: { xs: "100%", md: 720 },
              }}
            >
              <Box sx={heroPillSx}>
                <SchoolOutlinedIcon />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    תואר מוכר
                  </Typography>
                  <Typography sx={{ opacity: 0.9, fontSize: 12.5 }}>
                    תואר אקדמי מלא ומוכר
                  </Typography>
                </Box>
              </Box>

              <Box sx={heroPillSx}>
                <TrackChangesOutlinedIcon />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    התמקצעות
                  </Typography>
                  <Typography sx={{ opacity: 0.9, fontSize: 12.5 }}>
                    מסלולים והתמחויות מגוונות
                  </Typography>
                </Box>
              </Box>

              <Box sx={heroPillSx}>
                <GroupsOutlinedIcon />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    צוות מקצועי
                  </Typography>
                  <Typography sx={{ opacity: 0.9, fontSize: 12.5 }}>
                    מרצים בעלי ניסיון תעשייה
                  </Typography>
                </Box>
              </Box>

              <Box sx={heroPillSx}>
                <AutoAwesomeOutlinedIcon />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    טכנולוגיה מתקדמת
                  </Typography>
                  <Typography sx={{ opacity: 0.9, fontSize: 12.5 }}>
                    למידה עם כלים עדכניים
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          mt: 3.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" },
          gap: 3,
          alignItems: "start",
          gridTemplateAreas: {
            xs: `"requirements"
                 "fit"
                 "courses"
                 "deadlines"
                 "faq"
                 "cta"`,
            lg: `"requirements fit"
                 "courses deadlines"
                 "faq cta"`,
          },
        }}
      >
        <Paper sx={{ ...cardSx, gridArea: "requirements" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              דרישות קבלה עיקריות
            </Typography>
            <Chip
              size="small"
              label={`${requirements.length} דרישות`}
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ mb: 2.2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {(["פסיכומטרי", "בגרות"] as RequirementType[]).map((t) => {
              const list = reqByType[t] ?? [];
              return (
                <Paper
                  key={t}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 4, minWidth: 0 }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography sx={{ fontWeight: 900 }}>{t}</Typography>
                    <Chip size="small" label={`${list.length}`} />
                  </Stack>

                  {list.length === 0 ? (
                    <Typography sx={{ opacity: 0.75 }}>
                      אין דרישות להצגה.
                    </Typography>
                  ) : (
                    <Stack spacing={1.2}>
                      {list.slice(0, 4).map((r) => (
                        <Box
                          key={r.id}
                          sx={{
                            p: 1.2,
                            borderRadius: 3,
                            bgcolor: "background.paper",
                          }}
                        >
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
                              label={`מינימום: ${r.minScore}`}
                              variant="outlined"
                            />
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
                                opacity: 0.8,
                                mt: 0.6,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {[r.description, r.extraInfo]
                                .filter(Boolean)
                                .join(" — ")}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </Box>

          <Box sx={{ mt: 2.2 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 4, minWidth: 0 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography sx={{ fontWeight: 900 }}>אנגלית</Typography>
                <Chip
                  size="small"
                  label={`${(reqByType["אנגלית"] ?? []).length}`}
                />
              </Stack>

              {(reqByType["אנגלית"] ?? []).length === 0 ? (
                <Typography sx={{ opacity: 0.75 }}>
                  אין דרישות להצגה.
                </Typography>
              ) : (
                <Stack spacing={1.2}>
                  {(reqByType["אנגלית"] ?? []).slice(0, 3).map((r) => (
                    <Box
                      key={r.id}
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                      }}
                    >
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
                          label={`מינימום: ${r.minScore}`}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Paper>

        <Paper sx={{ ...cardSx, gridArea: "fit" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              מחשבון בדיקת התאמה
            </Typography>
            <Chip size="small" label="דוגמה" variant="outlined" />
          </Stack>

          <Typography sx={{ opacity: 0.75, mb: 2 }}>
            הזיני ציונים כדי לקבל אינדיקציה בסיסית מול דרישות המינימום שבמערכת.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.2,
            }}
          >
            <TextField
              label="ציון פסיכומטרי (מינימום)"
              value={fit.psychometric}
              onChange={(e) =>
                setFit((p) => ({ ...p, psychometric: e.target.value }))
              }
            />
            <TextField
              label="ממוצע בגרות (מינימום)"
              value={fit.bagrutAvg}
              onChange={(e) =>
                setFit((p) => ({ ...p, bagrutAvg: e.target.value }))
              }
            />
            <TextField
              label="ציון אנגלית (מינימום)"
              value={fit.english}
              onChange={(e) =>
                setFit((p) => ({ ...p, english: e.target.value }))
              }
            />
            <Button
              variant="contained"
              sx={{ fontWeight: 900 }}
              onClick={() => navigate("/user/requirements")}
            >
              בדוק התאמה
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {!fitResult.anyEntered ? (
            <Typography sx={{ opacity: 0.75 }}>
              לחצי על "בדוק התאמה" כדי לראות סטטוס מול דרישות מינימום.
            </Typography>
          ) : (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  label={
                    fitResult.psychMin !== undefined
                      ? `פסיכומטרי (מינימום ${fitResult.psychMin})`
                      : "פסיכומטרי"
                  }
                  color={
                    fitResult.psychOk === null
                      ? "default"
                      : fitResult.psychOk
                      ? "success"
                      : "error"
                  }
                  variant={fitResult.psychOk === null ? "outlined" : "filled"}
                />
                <Chip
                  label={
                    fitResult.bagrutMin !== undefined
                      ? `בגרות (מינימום ${fitResult.bagrutMin})`
                      : "בגרות"
                  }
                  color={
                    fitResult.bagrutOk === null
                      ? "default"
                      : fitResult.bagrutOk
                      ? "success"
                      : "error"
                  }
                  variant={fitResult.bagrutOk === null ? "outlined" : "filled"}
                />
                <Chip
                  label={
                    fitResult.engMin !== undefined
                      ? `אנגלית (מינימום ${fitResult.engMin})`
                      : "אנגלית"
                  }
                  color={
                    fitResult.engOk === null
                      ? "default"
                      : fitResult.engOk
                      ? "success"
                      : "error"
                  }
                  variant={fitResult.engOk === null ? "outlined" : "filled"}
                />
              </Stack>

              <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
                זו אינדיקציה בסיסית בלבד. הדרישות הסופיות תלויות במסלול
                ובמדיניות המוסד.
              </Typography>
            </Stack>
          )}
        </Paper>

        <Paper sx={{ ...cardSx, gridArea: "courses" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              קורסים לדוגמה
            </Typography>
            <MenuBookOutlinedIcon />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {sampleCourses.length === 0 ? (
            <Typography sx={{ opacity: 0.75 }}>אין קורסים להצגה.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {sampleCourses.map((c) => (
                <Paper
                  key={c.code}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 4 }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900 }}>{c.name}</Typography>
                      <Typography sx={{ opacity: 0.8, fontSize: 13 }}>
                        קוד: {c.code} · סמסטר: {c.semester} · נק״ז: {c.credits}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate("/user/courses")}
                      sx={{ fontWeight: 900, borderRadius: 3, flexShrink: 0 }}
                    >
                      צפייה
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ ...cardSx, gridArea: "deadlines" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              מועדי הרשמה קרובים
            </Typography>
            <CalendarMonthOutlinedIcon />
          </Stack>

          {activeDeadlines.length === 0 ? (
            <Typography sx={{ opacity: 0.75 }}>
              אין מועדים פעילים כרגע.
            </Typography>
          ) : (
            <Stack spacing={1.2}>
              {activeDeadlines.map((d) => {
                const status = registrationDeadlinesService.statusOf(d);
                return (
                  <Paper
                    key={d.id}
                    variant="outlined"
                    sx={{ p: 1.6, borderRadius: 4 }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography sx={{ fontWeight: 900 }}>
                        {d.title}
                      </Typography>
                      <Chip size="small" label={status} />
                    </Stack>
                    <Typography sx={{ opacity: 0.8, mt: 0.6, fontSize: 13 }}>
                      {d.startDate} — {d.endDate}
                    </Typography>
                  </Paper>
                );
              })}
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/user/request")}
            sx={{ fontWeight: 900, borderRadius: 3 }}
            disabled={loading}
            startIcon={<SendOutlinedIcon />}
          >
            הגשת בקשה עכשיו
          </Button>
        </Paper>

        <Paper sx={{ ...cardSx, gridArea: "faq" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              שאלות נפוצות
            </Typography>
            <HelpOutlineOutlinedIcon />
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 900 }}>
                מהם תנאי הקבלה לתוכנית?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ opacity: 0.85 }}>
                תנאי הקבלה נקבעים לפי דרישות המינימום שמופיעות במסך "דרישות
                קבלה".
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 900 }}>
                איך מגישים בקשת הרשמה?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ opacity: 0.85 }}>
                לוחצים על "הגשת בקשת הרשמה", ממלאים פרטים ושולחים. ניתן ליצור
                קשר בכל שלב.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/user/help")}
              sx={{ fontWeight: 900, borderRadius: 3 }}
            >
              מעבר לכל השאלות
            </Button>
          </Box>
        </Paper>

        <Paper
          sx={{
            ...cardSx,
            gridArea: "cta",
            background:
              "linear-gradient(90deg, rgba(82, 97, 214, 0.90) 0%, rgba(132, 43, 187, 0.92) 100%)",
            color: "common.white",
          }}
        >
          <Stack spacing={1.2}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              מוכנים להגיש בקשה?
            </Typography>
            <Typography sx={{ opacity: 0.92 }}>
              אם יש לך שאלה או מסמך חסר — אפשר ליצור קשר, ונחזור אליך בהקדם.
            </Typography>

            <Stack direction="row" spacing={1.2} sx={{ mt: 1 }}>
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
                הגשת בקשה אישית
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/user/request")}
                startIcon={<SendOutlinedIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.55)",
                  color: "common.white",
                  fontWeight: 900,
                  borderRadius: 3,
                  "&:hover": { borderColor: "rgba(255,255,255,0.85)" },
                }}
              >
                בקשת הרשמה
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={snackbar.close}
      />
    </Box>
  );
}
