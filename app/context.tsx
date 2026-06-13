"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Company, Task } from "./types";
import {
  getCompanies, saveCompanies,
  getTasks, saveTasks,
  getStatuses, saveStatuses,
} from "./store";

interface AppContextType {
  companies: Company[];
  tasks: Task[];
  statuses: string[];
  setCompanies: (c: Company[]) => void;
  setTasks: (t: Task[]) => void;
  setStatuses: (s: string[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [companies, setCompaniesState] = useState<Company[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [statuses, setStatusesState] = useState<string[]>([]);

  useEffect(() => {
    setCompaniesState(getCompanies());
    setTasksState(getTasks());
    setStatusesState(getStatuses());
  }, []);

  function setCompanies(c: Company[]) { setCompaniesState(c); saveCompanies(c); }
  function setTasks(t: Task[]) { setTasksState(t); saveTasks(t); }
  function setStatuses(s: string[]) { setStatusesState(s); saveStatuses(s); }

  return (
    <AppContext.Provider value={{ companies, tasks, statuses, setCompanies, setTasks, setStatuses }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
