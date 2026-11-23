"use client";

import Link from "next/link";
import { useSession } from "../lib/auth-client";

export default function HomePage() {
  const { data: session, isPending } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white p-6">
      <div className="max-w-xl text-center space-y-6">
        <span className="bg-blue-800/80 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Instant P2P & Bank Wallet
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Paytm Digital Wallet
        </h1>

        <p className="text-blue-200 text-lg">
          Add money from your bank instantly and send P2P payments securely with atomic ledger protection.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          {isPending ? (
            <button disabled className="bg-white/20 px-6 py-3 rounded-xl font-semibold">
              Checking session...
            </button>
          ) : session ? (
            <Link
              href="/dashboard"
              className="bg-sky-400 text-blue-950 px-8 py-3 rounded-xl font-bold hover:bg-sky-300 transition"
            >
              Go to Wallet Dashboard →
            </Link>
          ) : (
            <Link
              href="/auth"
              className="bg-white text-blue-950 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              Login / Create Account
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}