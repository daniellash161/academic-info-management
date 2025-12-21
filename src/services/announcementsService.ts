import { LS_KEYS } from "../storage/lsKeys";
import { makeId, readLS, writeLS } from "../storage/storage";
import type { Announcement } from "../models/announcement";

function readAll(): Announcement[] {
  return readLS<Announcement[]>(LS_KEYS.announcements, []);
}

function writeAll(items: Announcement[]) {
  writeLS(LS_KEYS.announcements, items);
}

function norm(s: string) {
  return s.trim();
}

export const announcementsService = {
  getAll(): Announcement[] {
    return [...readAll()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  getActive(): Announcement[] {
    return this.getAll().filter((a) => a.isActive);
  },

  getById(id: string): Announcement | undefined {
    return readAll().find((a) => a.id === id);
  },

  search(query: string, activeOnly: boolean): Announcement[] {
    const q = query.trim().toLowerCase();
    const base = activeOnly ? this.getActive() : this.getAll();
    if (!q) return base;

    return base.filter((a) => {
      const hay = `${a.title} ${a.content}`.toLowerCase();
      return hay.includes(q);
    });
  },

  create(input: Omit<Announcement, "id">): Announcement {
    const item: Announcement = {
      ...input,
      id: makeId(),
      title: norm(input.title),
      content: norm(input.content),
    };
    writeAll([item, ...readAll()]);
    return item;
  },

  update(id: string, patch: Partial<Omit<Announcement, "id">>): Announcement | undefined {
    const all = readAll();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;

    const updated: Announcement = {
      ...all[idx],
      ...patch,
      id,
      title: patch.title !== undefined ? norm(patch.title) : all[idx].title,
      content: patch.content !== undefined ? norm(patch.content) : all[idx].content,
    };

    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string) {
    writeAll(readAll().filter((a) => a.id !== id));
  },
};