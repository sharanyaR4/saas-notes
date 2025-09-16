"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login({ email, password });

    if (success) {
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  const testAccounts = [
    { email: "admin@acme.test", label: "Acme Admin" },
    { email: "user@acme.test", label: "Acme Member" },
    { email: "admin@globex.test", label: "Globex Admin" },
    { email: "user@globex.test", label: "Globex Member" },
  ];

  const handleTestAccountClick = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword("password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            SaaS Notes Application
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="text-sm text-gray-600 mb-4 text-center">
              Test Accounts (Click to use):
            </div>
            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleTestAccountClick(account.email)}
                  className="text-left px-4 py-3 text-sm bg-gray-100 hover:bg-indigo-50 rounded-md transition-colors border border-gray-200 hover:border-indigo-300"
                >
                  <div className="font-medium text-gray-900">
                    {account.label}
                  </div>
                  <div className="text-gray-600">{account.email}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Password: password
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
