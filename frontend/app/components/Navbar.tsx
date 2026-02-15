import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="font-sans font-bold text-3xl tracking-tight text-[#7825ff]">
                    Performix
                </Link>
                <nav className="flex gap-6 items-center">
                    <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[#7825ff] transition-colors">
                        Home
                    </Link>
                    <Link href="/pages/analysis" className="text-sm font-medium text-gray-700 hover:text-[#7825ff] transition-colors">
                        Analysis Dashboard
                    </Link>
                    <Link href="/pages/login">
                        <span className="px-4 py-2 rounded-full bg-[#7825ff] text-white text-sm font-medium hover:bg-[#6c20e8] transition-colors shadow-md hover:shadow-lg">
                            Login / Signup
                        </span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}