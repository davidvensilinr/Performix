"use client"
import Navbar from "@/app/components/Navbar";

export default function OrganisationDashboard() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Employee Search</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                            <input
                                placeholder="Search for an employee..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button className="w-full py-3 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}