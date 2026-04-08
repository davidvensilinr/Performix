"use client";

import { useState, useEffect } from "react";

export type GuestOrg = {
    id: number;
    name: string;
    managed_by: string;
};

export type GuestEmployee = {
    emp_id: number;
    emp_name: string;
    orgid: number;
    tasks: number | null;
    deadline_met: number | null;
    averagetime: number | null;
};

type GuestStore = {
    organisations: GuestOrg[];
    employees: GuestEmployee[];
};

const STORAGE_KEY = "performix_guest";

function loadStore(): GuestStore {
    if (typeof window === "undefined") return { organisations: [], employees: [] };
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { organisations: [], employees: [] };
    } catch {
        return { organisations: [], employees: [] };
    }
}

function saveStore(store: GuestStore) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch { /* ignore */ }
}

export function useGuestStore() {
    const [store, setStore] = useState<GuestStore>({ organisations: [], employees: [] });

    useEffect(() => {
        setStore(loadStore());
    }, []);

    const persist = (next: GuestStore) => {
        saveStore(next);
        setStore(next);
    };

    const addOrg = (name: string, managed_by: string): GuestOrg => {
        const current = loadStore();
        const newOrg: GuestOrg = {
            id: Date.now(),
            name,
            managed_by,
        };
        persist({ ...current, organisations: [...current.organisations, newOrg] });
        return newOrg;
    };

    const getOrgs = (): GuestOrg[] => loadStore().organisations;

    const getOrgById = (id: number): GuestOrg | undefined =>
        loadStore().organisations.find(o => o.id === id);

    const addEmployee = (data: Omit<GuestEmployee, "emp_id">): GuestEmployee => {
        const current = loadStore();
        const emp: GuestEmployee = { ...data, emp_id: Date.now() };
        persist({ ...current, employees: [...current.employees, emp] });
        return emp;
    };

    const getEmployeesByOrg = (orgId: number): GuestEmployee[] =>
        loadStore().employees.filter(e => e.orgid === orgId);

    return { store, addOrg, getOrgs, getOrgById, addEmployee, getEmployeesByOrg };
}
