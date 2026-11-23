"use client";

import { useState } from "react";
import { signIn, signUp } from "../../lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isLogin) {
            const { error } = await signIn.email({ email, password });
            if (error) return setError(error.message || "Login failed");
        } else {
            const { error } = await signUp.email({
                email,
                password,
                name,
                phoneNumber,
            } as any);
            if (error) return setError(error.message || "Signup failed");
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold text-center text-blue-900">
                    {isLogin ? "Paytm Login" : "Create Paytm Account"}
                </h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                {!isLogin && (
                    <>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border p-2.5 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Phone Number (e.g., 9876543210)"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full border p-2.5 rounded-lg"
                            required
                        />
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2.5 rounded-lg"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2.5 rounded-lg"
                    required
                />

                <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700">
                    {isLogin ? "Sign In" : "Sign Up"}
                </button>

                <p
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-center text-blue-600 cursor-pointer"
                >
                    {isLogin ? "New user? Create an account" : "Already have an account? Sign In"}
                </p>
            </form>
        </div>
    );
}