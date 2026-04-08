"use client";

import { useState } from "react";
import DBErrorPopup from "./DBErrorPopup";
import type { useGuestStore } from "@/lib/useGuestStore";

type Props = {
    isGuest?: boolean;
    guestStore?: ReturnType<typeof useGuestStore>;
    onCreated?: (newOrg?: { id: number; name: string; managed_by: string }) => void;
};

export default function CreateOrg({ isGuest, guestStore, onCreated }: Props) {
    const [org, setOrg] = useState("");
    const [managed, setManaged] = useState("");
    const [loading, setLoading] = useState(false);
    const [dbError, setDbError] = useState(false);

    const addOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isGuest && guestStore) {
                const newOrg = guestStore.addOrg(org, managed);
                setOrg("");
                setManaged("");
                onCreated?.(newOrg);
            } else {
                const res = await fetch("/api/organisation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: org, managed_by: managed }),
                });

                if (res.ok) {
                    const newOrg = await res.json();
                    setOrg("");
                    setManaged("");
                    onCreated?.(newOrg);
                } else {
                    setDbError(true);
                }
            }
        } catch {
            setDbError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Organisation</h2>
                <form onSubmit={addOrg} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
                        <input
                            placeholder="e.g. Acme Corp"
                            value={org}
                            onChange={e => setOrg(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Managed By</label>
                        <input
                            placeholder="e.g. John Doe"
                            value={managed}
                            onChange={e => setManaged(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Adding..." : "Add Organisation"}
                    </button>
                </form>
            </div>

            {dbError && <DBErrorPopup onClose={() => setDbError(false)} />}
        </>
    );
}
