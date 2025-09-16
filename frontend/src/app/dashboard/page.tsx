'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import NotesList from '@/components/NotesList';
import UpgradeButton from '@/components/UpgradeButton';
import UserInvite from '@/components/UserInvite';
import { LogOut, Building2, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, getTenantInfo } = useAuth();
  const { 
    notes, 
    isLoading: notesLoading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote, 
    fetchNotes, 
    noteCount 
  } = useNotes();
  const router = useRouter();
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro'>('free');

  const tenantInfo = getTenantInfo();
  const canCreateMore = subscriptionPlan === 'pro' || noteCount < 3;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleUpgradeSuccess = () => {
    setSubscriptionPlan('pro');
    // Refetch notes to show unlimited capability
    fetchNotes();
  };

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                SaaS Notes
              </h1>
              {tenantInfo && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{tenantInfo.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Subscription Status */}
              {tenantInfo && (
                <UpgradeButton
                  tenantSlug={tenantInfo.slug}
                  isAdmin={user.role === 'admin'}
                  currentPlan={subscriptionPlan}
                  onUpgradeSuccess={handleUpgradeSuccess}
                />
              )}
              
              {/* User Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{user.email}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Admin User Invitation Section */}
          {user.role === 'admin' && (
            <div className="mb-6">
              <UserInvite />
            </div>
          )}

          {/* Plan Status */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Current Plan: {subscriptionPlan === 'pro' ? 'Pro' : 'Free'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {subscriptionPlan === 'pro' 
                      ? 'Unlimited notes' 
                      : `${noteCount}/3 notes used`
                    }
                  </p>
                </div>
                {subscriptionPlan === 'free' && !canCreateMore && (
                  <div className="text-sm text-orange-600 font-medium">
                    Note limit reached!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Notes Section */}
          {notesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <NotesList
              notes={notes}
              onDelete={deleteNote}
              onUpdate={updateNote}
              onCreate={createNote}
              canCreateMore={canCreateMore}
            />
          )}
        </div>
      </main>
    </div>
  );
}