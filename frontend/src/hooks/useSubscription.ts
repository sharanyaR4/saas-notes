import { useState, useEffect } from 'react';
import { tenantApi } from '@/lib/api';

export function useSubscription() {
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro'>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgradeTenant = async (tenantSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await tenantApi.upgrade(tenantSlug);
      setSubscriptionPlan(response.subscription_plan);
      
      return response;
    } catch (error: any) {
      setError(error.message || 'Upgrade failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize subscription plan (you could fetch this from backend if needed)
  useEffect(() => {
    // For now, default to free as per assignment requirements
    // In a real app, you'd fetch this from your backend
    setSubscriptionPlan('free');
  }, []);

  return {
    subscriptionPlan,
    setSubscriptionPlan,
    upgradeTenant,
    isLoading,
    error
  };
}