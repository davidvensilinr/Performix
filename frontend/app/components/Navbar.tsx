"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/pages/login");
        router.refresh();
        setSigningOut(false);
    };

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
                    {user && (
                        <Link href="/pages/analysis" className="text-sm font-medium text-gray-700 hover:text-[#7825ff] transition-colors">
                            Analysis Dashboard
                        </Link>
                    )}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[160px]">
                                {user.user_metadata?.full_name || user.email}
                            </span>
                            <button
                                onClick={handleSignOut}
                                disabled={signingOut}
                                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-60"
                            >
                                {signingOut ? "..." : "Sign Out"}
                            </button>
                        </div>
                    ) : (
                        <Link href="/pages/login">
                            <span className="px-4 py-2 rounded-full bg-[#7825ff] text-white text-sm font-medium hover:bg-[#6c20e8] transition-colors shadow-md hover:shadow-lg">
                                Login / Signup
                            </span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
