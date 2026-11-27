const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include", // NestJS BetterAuthGuard ko session cookie bhejta hai
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
}

// 1. User Entry-Point & Passbook APIs (/user/*)
export const userApi = {
    getMe: () => apiFetch<any>("/user/me"),

    updateProfile: (data: { name?: string; phoneNumber?: string }) =>
        apiFetch<any>("/user/profile", {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    getActivity: () => apiFetch<any>("/user/activity"),
};

// 2. Customer Wallet, Bank Top-up & P2P APIs (/wallet/* & /banking/*)
export const walletApi = {
    getSummary: () => apiFetch<any>("/wallet/summary"),

    // Updated to new /banking/onramp endpoint (purane naam se compatibility ke liye dono rakhe hain)
    initiateOnRamp: (amountInRupees: number, provider: string) =>
        apiFetch<{ transactionId: string; token: string; checkoutUrl: string }>(
            "/banking/transaction",
            {
                method: "POST",
                body: JSON.stringify({
                    amount: Math.round(amountInRupees * 100), // Rupees ko Paise mein convert karein
                    provider,
                }),
            }
        ),

    transferP2P: (toIdentifier: string, amountInRupees: number) =>
        apiFetch<{ message: string; transferId: string }>("/wallet/transfer", {
            method: "POST",
            body: JSON.stringify({
                toIdentifier,
                amount: Math.round(amountInRupees * 100), // Rupees ko Paise mein convert karein
            }),
        }),

    // Customer -> Merchant Payment (P2M)
    payMerchant: (merchantCode: string, amountInRupees: number, note?: string) =>
        apiFetch<{ message: string; transactionId: string }>("/merchant/pay", {
            method: "POST",
            body: JSON.stringify({
                merchantCode,
                amount: Math.round(amountInRupees * 100),
                note,
            }),
        }),
};