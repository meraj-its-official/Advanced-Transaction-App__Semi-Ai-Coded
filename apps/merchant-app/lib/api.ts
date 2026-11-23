const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

export const merchantGatewayApi = {
    getMe: () => apiFetch<any>("/user/me"),

    getMerchantSummary: () => apiFetch<any>("/merchant/summary"),

    registerBusiness: (businessName: string, category: string) =>
        apiFetch<any>("/merchant/register", {
            method: "POST",
            body: JSON.stringify({ businessName, category }),
        }),

    settleBalance: () =>
        apiFetch<any>("/merchant/settle", {
            method: "POST",
        }),
};