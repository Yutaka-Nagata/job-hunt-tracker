"use client";
import { Company, Task, STATUS_ORDER } from "./types";

const COMPANIES_KEY = "shukatsu_companies";
const TASKS_KEY    = "shukatsu_tasks";
const STATUSES_KEY = "shukatsu_statuses";

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCompanies(): Company[] {
  return load<Company>(COMPANIES_KEY, []);
}
export function saveCompanies(companies: Company[]) {
  save(COMPANIES_KEY, companies);
}

export function getTasks(): Task[] {
  return load<Task>(TASKS_KEY, []);
}
export function saveTasks(tasks: Task[]) {
  save(TASKS_KEY, tasks);
}

export function getStatuses(): string[] {
  return load<string>(STATUSES_KEY, STATUS_ORDER);
}
export function saveStatuses(statuses: string[]) {
  save(STATUSES_KEY, statuses);
}

export function newId(): string {
  return crypto.randomUUID();
}
