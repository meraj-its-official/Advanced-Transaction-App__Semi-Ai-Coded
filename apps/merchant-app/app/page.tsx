import Link from "next/link";

export default function MerchantHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center space-y-6">
      <h1 className="text-4xl font-extrabold text-indigo-400">Paytm for Business</h1>
      <p className="text-slate-300 max-w-md">
        Accept instant digital payments from customers, track live collections, and settle directly to your wallet.
      </p>
      <div className="flex gap-4">
        <Link href="/auth" className="bg-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500">
          Merchant Login / Sign Up
        </Link>
        <Link href="/dashboard" className="bg-slate-800 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700">
          Open Business Dashboard
        </Link>
      </div>
    </div>
  );
}