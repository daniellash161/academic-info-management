// src/storage/seed.ts
import { LS_KEYS } from "./lsKeys";
import { hasLS, makeId, readLS, writeLS } from "./storage";

import type { User } from "../models/user";
import type { RegistrationRequest } from "../models/registrationRequest";
import type { Course } from "../models/course";
import type { Requirement } from "../models/requirement";
import type { Faq } from "../models/faq";
import type { ContactMessage } from "../models/contactMessage";
import type { ContactStatus } from "../models/contactMessage";

export function seedUsersIfEmpty() {
  if (hasLS(LS_KEYS.users)) return;

  const users: User[] = Array.from({ length: 10 }).map((_, i) => ({
    id: makeId(),
    fullName: `מועמד ${i + 1}`,
    nationalId: String(100000000 + i),
    email: `candidate${i + 1}@mail.com`,
    phone: `05${String(10000000 + i).slice(0, 8)}`,
    role: "CANDIDATE",
    interest: "מדעי המחשב",
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
      courseCodes: [],
    })),
  ];

  writeLS(LS_KEYS.requirements, reqs);
}

export function seedFaqsIfEmpty() {
  if (hasLS(LS_KEYS.faqs)) return;

  const faqs: Faq[] = [
    {
      id: makeId(),
      question: "איך מגישים בקשת הרשמה?",
      answer: "נכנסים למסך בקשות הרשמה וממלאים את הטופס. לאחר שמירה ניתן לעדכן סטטוס לפי התהליך.",
      displayOrder: 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: makeId(),
      question: "מהם סטטוסי הבקשה האפשריים?",
      answer: "בטיוטה / נשלחה / מאושרת / נדחתה.",
      displayOrder: 2,
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: makeId(),
      question: "איך מוסיפים דרישות קבלה?",
      answer: "נכנסים למסך דרישות קבלה ולוחצים על 'הוספת דרישה חדשה'.",
      displayOrder: 3,
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
    ...Array.from({ length: 7 }).map((_, i) => ({
      id: makeId(),
      question: `שאלה נפוצה לדוגמה ${i + 1}`,
      answer: "תשובה לדוגמה. ניתן לערוך ולפרסם/להסתיר.",
      displayOrder: 4 + i,
      isPublished: i % 2 === 0,
      createdAt: new Date().toISOString(),
    })),
  ];

  writeLS(LS_KEYS.faqs, faqs);
}

export function seedContactsIfEmpty() {
  if (hasLS(LS_KEYS.contacts)) return;

  const statuses: ContactStatus[] = ["חדש", "בטיפול", "טופל"];
  const items: ContactMessage[] = Array.from({ length: 10 }).map((_, i) => ({
    id: makeId(),
    fullName: `פונה ${i + 1}`,
    email: `contact${i + 1}@mail.com`,
    phone: `05${String(20000000 + i).slice(0, 8)}`,
    subject: `נושא פנייה ${i + 1}`,
    message: `זו הודעת פנייה לדוגמה מספר ${i + 1}.`,
    status: statuses[i % statuses.length],
    adminNotes: i % 3 === 0 ? "טופל חלקית / נדרש מעקב" : "",
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));

  writeLS(LS_KEYS.contacts, items);
}