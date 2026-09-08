"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const setAuth = useAuthStore(state => state.setAuth);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call to AuthController
    setAuth("mock-jwt-token", "account-1");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-xl shadow-md flex flex-col gap-4 w-96">
        <h1 className="text-2xl font-bold">Login to Deriva</h1>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="border p-2 rounded" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}
