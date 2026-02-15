"use client"
import CreateOrg from "@/app/components/CreateOrg";
import Navbar from "@/app/components/Navbar"
import Org from "@/app/components/org"
import { useEffect, useState } from "react"

export default function Analysis() {
    const [organisation, setOrganisation] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/organisation")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setOrganisation(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch organisations:", error);
                setOrganisation([]);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Sidebar: Create Org */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        <div className="bg-[#7825ff]/5 p-6 rounded-2xl border border-[#7825ff]/10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h2>
                            <p className="text-gray-600 mb-6">Create a new organization to start tracking performance.</p>
                            <CreateOrg />
                        </div>
                    </div>

                    {/* Right Content: Org List */}
                    <div className="w-full lg:w-2/3">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Your Organisations</h1>
                            <p className="text-gray-500 mt-2">Select an organization to view its analysis dashboard.</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {organisation.map((o: any) => (
                                    <Org key={o.id} id={o.id} name={o.name} managed_by={o.managed_by} />
                                ))}
                                {organisation.length === 0 && (
                                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500">No organizations found. Create one to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}