import Navbar from "../../components/Navbar";

export default function Signup() {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8">
                        <h1 className="text-center pb-6 text-3xl font-bold text-gray-800 tracking-tight">Create Account</h1>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <button className="w-full py-3 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                                Sign Up
                            </button>
                        </form>
                    </div>
                    <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                            Already have an account? <span className="text-[#7825ff] font-semibold cursor-pointer hover:underline">Login</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}