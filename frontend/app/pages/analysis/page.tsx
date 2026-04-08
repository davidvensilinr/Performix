"use client";

import CreateOrg from "@/app/components/CreateOrg";
import Navbar from "@/app/components/Navbar";
import Org from "@/app/components/org";
import DBErrorPopup from "@/app/components/DBErrorPopup";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useGuestStore, type GuestOrg } from "@/lib/useGuestStore";
import Link from "next/link";

type Organisation = {
    id: number;
    name: string;
    managed_by: string;
};

export default function Analysis() {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    const guest = useGuestStore();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                // Authenticated — fetch from DB
                fetchOrgsFromDB();
            } else {
                // Guest — load from session storage
                setIsGuest(true);
                setOrganisations(guest.getOrgs());
                setLoading(false);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrgsFromDB = () => {
        setLoading(true);
        fetch("/api/organisation")
            .then(res => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            })
            .then(data => {
                setOrganisations(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setDbError(true);
                setOrganisations([]);
                setLoading(false);
            });
    };

    const handleOrgCreated = (newOrg?: Organisation) => {
        if (isGuest && newOrg) {
            setOrganisations(guest.getOrgs());
        } else {
            fetchOrgsFromDB();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            {/* Guest demo banner */}
            {isGuest && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
                    You&apos;re in <span className="font-semibold">demo mode</span> — data resets on refresh.{" "}
                    <Link href="/pages/signup" className="font-bold underline hover:text-amber-900">
                        Sign up
                    </Link>{" "}
                    to save your data permanently.
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        <div className="bg-[#7825ff]/5 p-6 rounded-2xl border border-[#7825ff]/10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h2>
                            <p className="text-gray-600 mb-6">Create a new organization to start tracking performance.</p>
                            <CreateOrg isGuest={isGuest} guestStore={guest} onCreated={handleOrgCreated} />
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Your Organisations</h1>
                            <p className="text-gray-500 mt-2">Select an organization to view its dashboard.</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-40 bg-gray-200 rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {organisations.map(o => (
                                    <Org key={o.id} id={o.id} name={o.name} managed_by={o.managed_by} />
                                ))}
                                {organisations.length === 0 && (
                                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500">No organizations yet. Create one to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {dbError && <DBErrorPopup onClose={() => setDbError(false)} />}
        </div>
    );
}
