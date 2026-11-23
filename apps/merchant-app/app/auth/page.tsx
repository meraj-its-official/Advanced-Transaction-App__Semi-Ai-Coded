"use client";

import { useState } from "react";
import { signIn, signUp } from "../../lib/auth-client";
import { useRouter } from "next/navigation";

export default function MerchantAuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isLogin) {
            const { error } = await signIn.email({ email, password });
            if (error) return setError(error.message || "Sign in failed");
        } else {
            const { error } = await signUp.email({ email, password, name });
            if (error) return setError(error.message || "Registration failed");
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold text-center text-indigo-950">
                    {isLogin ? "Merchant Sign In" : "Create Merchant Account"}
                </h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Business Owner Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-3 rounded-lg"
                        required
                    />
                )}

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                    required
                />

                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
                    {isLogin ? "Sign In" : "Continue"}
                </button>

                <p onClick={() => setIsLogin(!isLogin)} className="text-sm text-center text-indigo-600 cursor-pointer">
                    {isLogin ? "New merchant? Create an account" : "Already have an account? Sign In"}
                </p>
            </form>
        </div>
    );
}