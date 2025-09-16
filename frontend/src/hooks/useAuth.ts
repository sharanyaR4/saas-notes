import { useState, useEffect } from 'react';
import { User, LoginRequest } from '@/types/auth';
import { authApi } from '@/lib/api';
import { getToken, setToken, removeToken, decodeToken, isTokenExpired } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const token = getToken();
      
      if (token && !isTokenExpired(token)) {
        const tokenData = decodeToken(token);
        if (tokenData) {
          setUser({
            id: tokenData.user_id,
            email: tokenData.email,
            role: tokenData.role as 'admin' | 'member',
            tenant_id: tokenData.tenant_id,
            created_at: '',
            updated_at: ''
          });
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tokenResponse = await authApi.login(credentials);
      setToken(tokenResponse.access_token);
      
      const tokenData = decodeToken(tokenResponse.access_token);
      if (tokenData) {
        setUser({
          id: tokenData.user_id,
          email: tokenData.email,
          role: tokenData.role as 'admin' | 'member',
          tenant_id: tokenData.tenant_id,
          created_at: '',
          updated_at: ''
        });
      }
      
      return true;
    } catch (error: any) {
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setError(null);
  };

  const getTenantInfo = () => {
    if (!user) return null;
    
    const tenantMap: { [key: number]: { slug: string; name: string } } = {
      1: { slug: 'acme', name: 'Acme Corporation' },
      2: { slug: 'globex', name: 'Globex Corporation' }
    };
    
    return tenantMap[user.tenant_id] || null;
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    getTenantInfo
  };
}