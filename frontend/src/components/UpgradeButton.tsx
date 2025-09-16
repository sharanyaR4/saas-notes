'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import { tenantApi } from '@/lib/api';

interface UpgradeButtonProps {
  tenantSlug: string;
  isAdmin: boolean;
  currentPlan: 'free' | 'pro';
  onUpgradeSuccess: () => void;
}

export default function UpgradeButton({ 
  tenantSlug, 
  isAdmin, 
  currentPlan,
  onUpgradeSuccess 
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentPlan === 'pro') {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Crown className="w-3 h-3 mr-1" />
        Pro Plan
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Free Plan
      </div>
    );
  }

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await tenantApi.upgrade(tenantSlug);
      onUpgradeSuccess();
    } catch (error: any) {
      setError(error.message || 'Upgrade failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpgrade}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Crown className="w-4 h-4 mr-2" />
        {isLoading ? 'Upgrading...' : 'Upgrade to Pro'}
      </button>
      
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}