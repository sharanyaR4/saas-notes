"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Simple JWT decode function (you could also use a library like jwt-decode)
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUser = async (
    email: string,
    role: "admin" | "member" = "member"
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      
      // Decode JWT to get tenant_id
      const decodedToken = decodeJWT(token);
      const tenantId = decodedToken.tenant_id;
      
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          role,
          password: "password", // Default password for invited users
          tenant_id: tenantId, // Use tenant_id from decoded token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail?.[0]?.msg || // Handle validation errors
          errorData.detail ||
          errorData.message ||
          `HTTP ${response.status}: Failed to invite user`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inviteUser,
    isLoading,
    error,
  };
}

export default function UserInvite() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [showSuccess, setShowSuccess] = useState(false);
  const { inviteUser, isLoading, error } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      await inviteUser(email.trim(), role);
      setEmail("");
      setRole("member");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Failed to invite user:", error);
      // Error is already handled by the hook and will be displayed
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <UserPlus className="w-5 h-5 mr-2" />
        Admin: Invite User
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            />
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "member")}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? "Inviting..." : "Invite User"}
          </button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {showSuccess && (
          <div className="text-sm text-green-600">
            User invited successfully! Default password: password
          </div>
        )}
      </form>
    </div>
  );
}