"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "../../lib/auth-client";
import { merchantGatewayApi } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function MerchantDashboard() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [me, setMe] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [businessName, setBusinessName] = useState("");
    const [category, setCategory] = useState("Retail & Grocery");
    const [statusMsg, setStatusMsg] = useState("");

    const loadAll = async () => {
        try {
            const [userRes, merchantRes] = await Promise.all([
                merchantGatewayApi.getMe(),
                merchantGatewayApi.getMerchantSummary(),
            ]);
            setMe(userRes);
            setSummary(merchantRes);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        } else if (session) {
            loadAll();
        }
    }, [session, isPending]);

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await merchantGatewayApi.registerBusiness(businessName, category);
            setStatusMsg("Merchant account activated!");
            loadAll();
        } catch (err: any) {
            setStatusMsg(err.message);
        }
    };

    const handleSettle = async () => {
        try {
            const res = await merchantGatewayApi.settleBalance();
            setStatusMsg(res.message);
            loadAll();
        } catch (err: any) {
            setStatusMsg(err.message);
        }
    };

    if (isPending || !session || !summary) {
        return <div className="p-10 text-center">Loading Business Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow">
                    <div>
                        <h1 className="text-xl font-bold text-indigo-950">Paytm for Business</h1>
                        <p className="text-sm text-gray-500">
                            Owner: {me?.profile?.name} ({me?.profile?.email})
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            await signOut();
                            router.push("/auth");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                        Sign Out
                    </button>
                </div>

                {statusMsg && (
                    <div className="bg-indigo-100 text-indigo-950 p-3 rounded-lg text-sm font-medium">
                        {statusMsg}
                    </div>
                )}

                {!summary.isMerchant ? (
                    <form onSubmit={handleOnboard} className="bg-white p-6 rounded-xl shadow max-w-lg mx-auto space-y-4">
                        <h2 className="text-lg font-bold">Register Your Business</h2>
                        <input
                            type="text"
                            placeholder="Shop / Brand Name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full border p-3 rounded-lg"
                            required
                        />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border p-3 rounded-lg"
                        >
                            <option value="Retail & Grocery">Retail & Grocery</option>
                            <option value="Food & Cafe">Food & Cafe</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Services">Services</option>
                        </select>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">
                            Activate Merchant Account
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-indigo-950 text-white p-6 rounded-xl shadow space-y-3">
                                <span className="text-xs uppercase tracking-wider bg-indigo-800 px-2.5 py-1 rounded">
                                    {summary.merchant.category}
                                </span>
                                <h2 className="text-2xl font-bold">{summary.merchant.businessName}</h2>
                                <div className="pt-2">
                                    <p className="text-xs text-indigo-200">Unsettled Merchant Collection</p>
                                    <p className="text-4xl font-extrabold">
                                        ₹{(summary.merchant.balance / 100).toFixed(2)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSettle}
                                    className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-400"
                                >
                                    Settle to Personal Wallet
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center text-center space-y-3">
                                <p className="text-sm font-semibold text-gray-600">Your Merchant Payment ID</p>
                                <div className="bg-slate-100 border-2 border-dashed border-indigo-400 px-6 py-4 rounded-xl">
                                    <p className="text-2xl font-mono font-bold text-indigo-900">
                                        {summary.merchant.merchantCode}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Share this Merchant ID with customers to receive instant payments
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="font-bold text-lg mb-4">Customer Payments Received</h3>
                            {summary.merchant.transactions?.length === 0 ? (
                                <p className="text-sm text-gray-500">No customer payments received yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {summary.merchant.transactions.map((txn: any) => (
                                        <div key={txn.id} className="flex justify-between items-center border-b pb-3 text-sm">
                                            <div>
                                                <p className="font-semibold">{txn.fromUser.name}</p>
                                                <p className="text-xs text-gray-500">{txn.fromUser.email}</p>
                                                {txn.note && <p className="text-xs text-indigo-600 mt-0.5">Note: {txn.note}</p>}
                                            </div>
                                            <span className="font-bold text-emerald-600 text-base">
                                                +₹{(txn.amount / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}