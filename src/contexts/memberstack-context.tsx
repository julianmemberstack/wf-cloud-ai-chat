"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Member } from '@memberstack/dom';

interface MemberstackContextType {
  memberstack: any | null;
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

const MemberstackContext = createContext<MemberstackContextType>({
  memberstack: null,
  member: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
});

export function MemberstackProvider({ children }: { children: React.ReactNode }) {
  const [memberstack, setMemberstack] = useState<any | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    async function initializeMemberstack() {
      try {
        console.log('[Memberstack] Initializing...');
        
        const publicKey = process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error('Memberstack public key not found');
        }

        // Dynamically import Memberstack only on client side
        const { default: memberstackDOM } = await import('@memberstack/dom');

        const ms = memberstackDOM.init({
          publicKey,
          useCookies: true,
          sessionDurationDays: 30,
        });

        setMemberstack(ms);
        console.log('[Memberstack] Initialized successfully');

        // Check for existing member session
        try {
          const { data: currentMember } = await ms.getCurrentMember();
          if (currentMember) {
            setMember(currentMember);
            console.log('[Memberstack] Found existing member:', currentMember.auth.email);
          } else {
            console.log('[Memberstack] No existing member session');
          }
        } catch (memberError) {
          console.error('[Memberstack] Error getting current member:', memberError);
        }

        // Set up auth change listener
        const authListener = ms.onAuthChange((newMember) => {
          console.log('[Memberstack] Auth state changed:', newMember ? 'logged in' : 'logged out');
          setMember(newMember);
        });

        // Cleanup function
        return () => {
          console.log('[Memberstack] Cleaning up auth listener');
          authListener.unsubscribe();
        };
      } catch (err) {
        console.error('[Memberstack] Initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Memberstack'));
      } finally {
        setIsLoading(false);
      }
    }

    const cleanup = initializeMemberstack();

    return () => {
      cleanup.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [isClient]);

  const value = {
    memberstack,
    member,
    isLoading: !isClient || isLoading,
    isAuthenticated: !!member,
    error,
  };

  return (
    <MemberstackContext.Provider value={value}>
      {children}
    </MemberstackContext.Provider>
  );
}

export function useMemberstack() {
  const context = useContext(MemberstackContext);
  if (!context) {
    throw new Error('useMemberstack must be used within a MemberstackProvider');
  }
  return context;
}