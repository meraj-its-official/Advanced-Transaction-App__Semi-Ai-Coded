"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "../../lib/auth-client";
import { walletApi } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [summary, setSummary] = useState<any>(null);
    const [addAmount, setAddAmount] = useState("");
    const [bank, setBank] = useState("HDFC Bank");
    const [receiver, setReceiver] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [statusMsg, setStatusMsg] = useState("");

    const loadSummary = async () => {
        try {
            const data = await walletApi.getSummary();
            setSummary(data);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        } else if (session) {
            loadSummary();
        }
    }, [session, isPending]);

    // 1. Add Money -> Redirect to Mock Bank NetBanking Page
    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await walletApi.initiateOnRamp(Number(addAmount), bank);
            window.location.href = res.checkoutUrl;
        } catch (err: any) {
            setStatusMsg(err.message);
        }
    };

    // 2. P2P Money Transfer
    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMsg("");
        try {
            await walletApi.transferP2P(receiver, Number(sendAmount));
            setStatusMsg(`₹${sendAmount} sent to ${receiver}!`);
            setReceiver("");
            setSendAmount("");
            loadSummary(); // Balance refresh karein
        } catch (err: any) {
            setStatusMsg(err.message);
        }
    };

    if (isPending || !session) return <div className="p-8">Loading wallet...</div>;

    const balanceRupees = ((summary?.balance?.amount || 0) / 100).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
                    <div>
                        <h1 className="text-xl font-bold text-blue-900">Welcome, {session.user.name}</h1>
                        <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                    <button
                        onClick={async () => {
                            await signOut();
                            router.push("/auth");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Logout
                    </button>
                </div>

                {/* Balance Card */}
                <div className="bg-blue-900 text-white p-6 rounded-xl shadow">
                    <p className="text-sm opacity-80">Available Wallet Balance</p>
                    <h2 className="text-4xl font-bold mt-1">₹{balanceRupees}</h2>
                </div>

                {statusMsg && (
                    <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-medium">
                        {statusMsg}
                    </div>
                )}

                {/* Add Money & Send Money Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Add Money via Bank */}
                    <form onSubmit={handleAddMoney} className="bg-white p-6 rounded-xl shadow space-y-4">
                        <h3 className="font-bold text-lg">Add Money to Wallet</h3>
                        <input
                            type="number"
                            min="1"
                            placeholder="Amount in ₹ (e.g., 500)"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="w-full border p-2.5 rounded-lg"
                            required
                        />
                        <select
                            value={bank}
                            onChange={(e) => setBank(e.target.value)}
                            className="w-full border p-2.5 rounded-lg"
                        >
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                        </select>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold">
                            Proceed to Bank
                        </button>
                    </form>

                    {/* P2P Transfer */}
                    <form onSubmit={handleTransfer} className="bg-white p-6 rounded-xl shadow space-y-4">
                        <h3 className="font-bold text-lg">Send Money (P2P)</h3>
                        <input
                            type="text"
                            placeholder="Receiver Email or Phone Number"
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                            className="w-full border p-2.5 rounded-lg"
                            required
                        />
                        <input
                            type="number"
                            min="1"
                            placeholder="Amount in ₹"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            className="w-full border p-2.5 rounded-lg"
                            required
                        />
                        <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold">
                            Send Now
                        </button>
                    </form>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="font-bold text-lg mb-3">Recent Bank Top-Ups</h3>
                    {summary?.onRampTransactions?.length === 0 ? (
                        <p className="text-sm text-gray-500">No bank transactions yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {summary?.onRampTransactions?.map((t: any) => (
                                <div key={t.id} className="flex justify-between border-b pb-2 text-sm">
                                    <span>{t.provider} ({t.status})</span>
                                    <span className="font-semibold text-green-600">+₹{(t.amount / 100).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
