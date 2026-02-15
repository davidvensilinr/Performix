import Link from "next/link";
import Navbar from "./components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
        <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900">
            Analyze your Team's <br />
            <span className="text-[#7825ff]">Performance</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Performix is the all-in-one platform to track, manage, and optimize your organization's efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/pages/analysis">
              <button className="px-8 py-4 bg-[#7825ff] text-white text-lg font-bold rounded-full hover:bg-[#6c20e8] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Get Started
              </button>
            </Link>
            <Link href="/pages/login">
              <button className="px-8 py-4 bg-white text-[#7825ff] border-2 border-[#7825ff]/20 text-lg font-bold rounded-full hover:bg-gray-50 transition-all">
                Login
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}