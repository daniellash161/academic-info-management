import { LS_KEYS } from "./lsKeys";
import { hasLS, makeId, readLS, writeLS } from "./storage";

import type { User } from "../models/user";
import type { RegistrationRequest } from "../models/registrationRequest";
import type { Course } from "../models/course";
import type { Requirement } from "../models/requirement";
import type { ContactMessage } from "../models/contactMessage";
import type { RegistrationDeadline } from "../models/registrationDeadline";

export function seedUsersIfEmpty() {
  if (hasLS(LS_KEYS.users)) return;

  const users: User[] = Array.from({ length: 10 }).map((_, i) => ({
    id: makeId(),
    fullName: `מועמד ${i + 1}`,
    nationalId: String(100000000 + i),
    email: `candidate${i + 1}@mail.com`,
    phone: `05${String(10000000 + i).slice(0, 8)}`,
    role: "CANDIDATE",
    interest: undefined,
    notes: "",
    createdAt: new Date().toISOString(),
  }));

  writeLS(LS_KEYS.users, users);
}

export function seedRequestsIfEmpty() {
  if (hasLS(LS_KEYS.requests)) return;

  seedUsersIfEmpty();
  const candidates = readLS<User[]>(LS_KEYS.users, []);

  const statuses: RegistrationRequest["status"][] = ["בטיוטה", "נשלחה", "מאושרת", "נדחתה"];
  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  const requests: RegistrationRequest[] = Array.from({ length: 10 }).map((_, i) => {
    const candidate = candidates[i % candidates.length];
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    return {
      requestNumber: i + 1,
      candidateId: candidate.id,
      status: statuses[i % statuses.length],
      createdAt: ymd(d),
      notes: i % 3 === 0 ? "בקשה לדוגמה" : "",
    };
  });

  writeLS(LS_KEYS.requests, requests);
}

export function seedCoursesIfEmpty() {
  if (hasLS(LS_KEYS.courses)) return;

  const courses: Course[] = [
    { code: "CS101", name: "מבוא למדעי המחשב", semester: "א", credits: 5, lecturer: 'ד"ר כהן' },
    { code: "CS102", name: "תכנות מתקדם", semester: "ב", credits: 5, lecturer: 'ד"ר לוי', prerequisites: ["CS101"] },
    { code: "CS201", name: "מבני נתונים", semester: "א", credits: 4, lecturer: 'ד"ר שטיין', prerequisites: ["CS102"] },
    { code: "CS202", name: "אלגוריתמים", semester: "ב", credits: 4, lecturer: 'ד"ר שטיין', prerequisites: ["CS201"] },
    { code: "CS210", name: "בסיסי נתונים", semester: "א", credits: 3, lecturer: 'ד"ר ברק' },
    { code: "CS220", name: "מערכות הפעלה", semester: "ב", credits: 4, lecturer: 'ד"ר נוי', prerequisites: ["CS201"] },
    { code: "CS230", name: "רשתות מחשבים", semester: "א", credits: 3, lecturer: 'ד"ר נקר', prerequisites: ["CS201"] },
    { code: "CS240", name: "הנדסת תוכנה", semester: "ב", credits: 3, lecturer: 'ד"ר מאיה', prerequisites: ["CS102"] },
    { code: "CS250", name: "בינה מלאכותית", semester: "א", credits: 3, lecturer: 'ד"ר יעל', prerequisites: ["CS202"] },
    { code: "CS260", name: "אבטחת מידע", semester: "קיץ", credits: 2, lecturer: 'ד"ר אמיר', prerequisites: ["CS230"] },
  ];

  writeLS(LS_KEYS.courses, courses);
}

export function seedRequirementsIfEmpty() {
  if (hasLS(LS_KEYS.requirements)) return;

  const reqs: Requirement[] = [
    {
      id: makeId(),
      type: "פסיכומטרי",
      minScore: 550,
      title: "ציון פסיכומטרי מינימלי",
      description: "ציון סף לקבלה לתוכנית.",
      extraInfo: "במקרים חריגים תישקל ועדה.",
      displayOrder: 1,
      isMandatory: true,
      courseCodes: [],
    },
    {
      id: makeId(),
      type: "בגרות",
      minScore: 95,
      title: "ממוצע בגרויות מינימלי",
      description: "ממוצע בגרות בהתאם לדרישות התוכנית.",
      extraInfo: "",
      displayOrder: 2,
      isMandatory: true,
      courseCodes: [],
    },
    {
      id: makeId(),
      type: "אנגלית",
      minScore: 85,
      title: "רמת אנגלית",
      description: "עמידה בדרישות סיווג אנגלית.",
      extraInfo: "ניתן להשלים קורסי אנגלית בהתאם לצורך.",
      displayOrder: 3,
      isMandatory: false,
      courseCodes: [],
    },
    ...Array.from({ length: 7 }).map((_, i) => ({
      id: makeId(),
      type: (i % 3 === 0 ? "פסיכומטרי" : i % 3 === 1 ? "בגרות" : "אנגלית") as any,
      minScore: 60 + i * 5,
      title: `דרישה לדוגמה ${i + 1}`,
      description: "טקסט דוגמה קצר.",
      extraInfo: "",
      displayOrder: 4 + i,
      isMandatory: i % 2 === 0,
      courseCodes: i % 2 === 0 ? ["CS101", "CS201"] : [],
    })),
  ];

  writeLS(LS_KEYS.requirements, reqs);
}

export function seedContactMessagesIfEmpty() {
  if (hasLS(LS_KEYS.contactMessages)) return;

  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  const statuses: ContactMessage["status"][] = ["חדש", "בטיפול", "נסגר"];

  const items: ContactMessage[] = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    return {
      id: makeId(),
      createdAt: `${ymd(d)}T12:00:00.000Z`,
      fullName: `פונה ${i + 1}`,
      email: `contact${i + 1}@mail.com`,
      phone: `052000000${i}`,
      subject: `נושא פנייה ${i + 1}`,
      message: `זו הודעה לדוגמה מספר ${i + 1}.`,
      status: statuses[i % statuses.length],
      adminNote: i % 3 === 0 ? "הערת מנהל לדוגמה" : "",
    };
  });

  writeLS(LS_KEYS.contactMessages, items);
}

export function seedRegistrationDeadlinesIfEmpty() {
  if (hasLS(LS_KEYS.registrationDeadlines)) return;

  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  const items: RegistrationDeadline[] = Array.from({ length: 10 }).map((_, i) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (i * 7 + 3));

    const end = new Date(start);
    end.setDate(start.getDate() + 14);

    return {
      id: makeId(),
      title: `מועד הרשמה #${i + 1}`,
      startDate: ymd(start),
      endDate: ymd(end),
      isActive: i === 0,
      notes: i % 3 === 0 ? "הערה לדוגמה" : "",
      createdAt: new Date().toISOString(),
    };
  });

  writeLS(LS_KEYS.registrationDeadlines, items);
}

export function runSeed() {
  seedUsersIfEmpty();
  seedRequestsIfEmpty();
  seedCoursesIfEmpty();
  seedRequirementsIfEmpty();
  seedContactMessagesIfEmpty();
  seedRegistrationDeadlinesIfEmpty();
}