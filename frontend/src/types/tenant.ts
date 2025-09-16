export interface Tenant {
  id: number;
  slug: string;
  name: string;
  subscription_plan: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface UpgradeResponse {
  message: string;
  subscription_plan: 'free' | 'pro';
}