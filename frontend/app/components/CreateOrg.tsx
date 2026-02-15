import { useState } from "react";

type props = {
    name: string;
    managed_by: string;
}

export default function CreateOrg() {
    const [org, setOrg] = useState("");
    const [managed, setManaged] = useState("");
    const [loading, setLoading] = useState(false);

    const addOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/organisation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: org,
                    managed_by: managed
                })
            })
            if (res.ok) {
                setOrg("");
                setManaged("");
                // Optionally trigger a refresh or callback here
                window.location.reload(); // Simple reload to show new data, can be optimized later
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Organisation</h2>
            <form onSubmit={addOrg} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
                    <input
                        placeholder="e.g. Acme Corp"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Managed By</label>
                    <input
                        placeholder="e.g. John Doe"
                        value={managed}
                        onChange={(e) => setManaged(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Adding...' : 'Add Organisation'}
                </button>
            </form>
        </div>
    );
}