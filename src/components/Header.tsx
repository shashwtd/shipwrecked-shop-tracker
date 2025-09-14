import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";

export default function Header() {
    return (
        <header className="fixed select-none z-50 bg-[#c6b9ad] w-full h-max text-black/70 font-sans flex items-center justify-center">
            <div className="w-full flex justify-between items-center h-max px-8 py-3">
                <h1 className="text-xl font-semibold font-sans">
                    Shipwrecked Shop Tracker
                </h1>
                <ul className="flex items-center justify-center gap-6">
                    <li>
                        <Link
                            href="/guide"
                            className="hover:underline font-medium underline-offset-2"
                        >
                            How to use?
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/guide"
                            className="bg-white/40 px-4 py-1.5 hover:text-black font-medium rounded-lg hover:bg-white/70 flex items-center justify-center gap-2"
                        >
                            <Github size={18} className="text-inherit" />
                            Github
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    );
}
