import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { InterpretationsPayload, PremiumStatus, User } from '../lib/types';

type AuthContextValue = {
  loading: boolean;
  token: string | null;
  user: User | null;
  profileComplete: boolean;
  privateProfileComplete: boolean;
  termsAccepted: boolean;
  connectContactsEnabled: boolean;
  premium: PremiumStatus;
  scores: Record<string, number | null>;
  interpretations: InterpretationsPayload | null;
  signUp: (payload: { email: string; password: string; name: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  acceptTerms: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (payload: {
    name?: string;
    age?: number;
    gender?: string;
    preference?: string;
    bio?: string;
    preferredLanguage?: string;
    avatarUrl?: string;
    defaultQuestions?: string[];
  }) => Promise<void>;
  updatePrivateProfile: (payload: {
    privateEmail?: string;
    privatePhone?: string;
    privateLocation?: string;
    privateNotes?: string;
  }) => Promise<void>;
  updateContactPreferences: (payload: { enabled: boolean; contacts: string[] }) => Promise<void>;
  upgradeMonthly: () => Promise<void>;
  fetchCommunitySuggestions: () => Promise<{ prompt: string; suggestions: string[] } | null>;
  joinCommunity: (communityLabel: string) => Promise<void>;
  leaveCommunity: () => Promise<void>;
  setScores: (next: Record<string, number | null>) => void;
  setInterpretations: (next: InterpretationsPayload | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withAuthRetry<T>(task: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : '';
      const transient =
        message.includes('Service temporarily unavailable') ||
        message.includes('Network request failed') ||
        message.includes('fetch');
      if (!transient || attempt >= 2) break;
      await wait(1500);
    }
  }
  throw lastError;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [privateProfileComplete, setPrivateProfileComplete] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [connectContactsEnabled, setConnectContactsEnabled] = useState(false);
  const [premium, setPremium] = useState<PremiumStatus>({ isPremium: false, premiumUntil: null });
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [interpretations, setInterpretations] = useState<InterpretationsPayload | null>(null);

  const refreshMe = async () => {
    if (!token) return;
    const data = await apiRequest<{
      user: User;
      profileComplete: boolean;
      privateProfileComplete: boolean;
      termsAccepted: boolean;
      premium: PremiumStatus;
      connectContactsEnabled: boolean;
      scores: Record<string, number | null>;
      interpretations: InterpretationsPayload;
    }>('/me', {}, token);
    setUser(data.user);
    setProfileComplete(data.profileComplete);
    setPrivateProfileComplete(data.privateProfileComplete);
    setTermsAccepted(Boolean(data.termsAccepted));
    setConnectContactsEnabled(Boolean(data.connectContactsEnabled));
    setPremium(data.premium || { isPremium: false, premiumUntil: null });
    setScores(data.scores || {});
    setInterpretations(data.interpretations || null);
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('soul_mirror_token');
        if (stored) {
          setToken(stored);
          const data = await apiRequest<{
            user: User;
            profileComplete: boolean;
            privateProfileComplete: boolean;
            termsAccepted: boolean;
            premium: PremiumStatus;
            connectContactsEnabled: boolean;
            scores: Record<string, number | null>;
            interpretations: InterpretationsPayload;
          }>('/me', {}, stored);
          setUser(data.user);
          setProfileComplete(data.profileComplete);
          setPrivateProfileComplete(data.privateProfileComplete);
          setTermsAccepted(Boolean(data.termsAccepted));
          setConnectContactsEnabled(Boolean(data.connectContactsEnabled));
          setPremium(data.premium || { isPremium: false, premiumUntil: null });
          setScores(data.scores || {});
          setInterpretations(data.interpretations || null);
        }
      } catch (_e) {
        await AsyncStorage.removeItem('soul_mirror_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signUp = async (payload: { email: string; password: string; name: string }) => {
    await withAuthRetry(() => apiRequest('/health'));
    const data = await withAuthRetry(() =>
      apiRequest<{ token: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ...payload, termsAccepted: true })
      })
    );
    await AsyncStorage.setItem('soul_mirror_token', data.token);
    setToken(data.token);
    const me = await apiRequest<{
      user: User;
      profileComplete: boolean;
      privateProfileComplete: boolean;
      termsAccepted: boolean;
      premium: PremiumStatus;
      connectContactsEnabled: boolean;
      scores: Record<string, number | null>;
      interpretations: InterpretationsPayload;
    }>(
      '/me',
      {},
      data.token
    );
    setUser(me.user);
    setProfileComplete(me.profileComplete);
    setPrivateProfileComplete(me.privateProfileComplete);
    setTermsAccepted(Boolean(me.termsAccepted));
    setConnectContactsEnabled(Boolean(me.connectContactsEnabled));
    setPremium(me.premium || { isPremium: false, premiumUntil: null });
    setScores(me.scores || {});
    setInterpretations(me.interpretations || null);
  };

  const login = async (payload: { email: string; password: string }) => {
    await withAuthRetry(() => apiRequest('/health'));
    const data = await withAuthRetry(() =>
      apiRequest<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
    await AsyncStorage.setItem('soul_mirror_token', data.token);
    setToken(data.token);
    const me = await apiRequest<{
      user: User;
      profileComplete: boolean;
      privateProfileComplete: boolean;
      termsAccepted: boolean;
      premium: PremiumStatus;
      connectContactsEnabled: boolean;
      scores: Record<string, number | null>;
      interpretations: InterpretationsPayload;
    }>(
      '/me',
      {},
      data.token
    );
    setUser(me.user);
    setProfileComplete(me.profileComplete);
    setPrivateProfileComplete(me.privateProfileComplete);
    setTermsAccepted(Boolean(me.termsAccepted));
    setConnectContactsEnabled(Boolean(me.connectContactsEnabled));
    setPremium(me.premium || { isPremium: false, premiumUntil: null });
    setScores(me.scores || {});
    setInterpretations(me.interpretations || null);
  };

  const acceptTerms = async () => {
    if (!token) throw new Error('Not authenticated');
    await apiRequest('/compliance/accept-terms', { method: 'POST' }, token);
    setTermsAccepted(true);
    await refreshMe();
  };

  const logout = async () => {
    if (token) {
      try {
        await apiRequest('/auth/logout', { method: 'POST' }, token);
      } catch (_e) {
        // Best effort.
      }
    }
    await AsyncStorage.removeItem('soul_mirror_token');
    setToken(null);
    setUser(null);
    setProfileComplete(false);
    setPrivateProfileComplete(false);
    setTermsAccepted(false);
    setConnectContactsEnabled(false);
    setPremium({ isPremium: false, premiumUntil: null });
    setScores({});
    setInterpretations(null);
  };

  const deleteAccount = async () => {
    if (!token) throw new Error('Not authenticated');
    await apiRequest('/account', { method: 'DELETE' }, token);
    await AsyncStorage.removeItem('soul_mirror_token');
    setToken(null);
    setUser(null);
    setProfileComplete(false);
    setPrivateProfileComplete(false);
    setTermsAccepted(false);
    setConnectContactsEnabled(false);
    setPremium({ isPremium: false, premiumUntil: null });
    setScores({});
    setInterpretations(null);
  };

  const updateProfile = async (payload: {
    name?: string;
    age?: number;
    gender?: string;
    preference?: string;
    bio?: string;
    preferredLanguage?: string;
    avatarUrl?: string;
    defaultQuestions?: string[];
  }) => {
    if (!token) throw new Error('Not authenticated');
    const data = await apiRequest<{ user: User }>(
      '/profile',
      { method: 'PUT', body: JSON.stringify(payload) },
      token
    );
    setUser(data.user);
    setProfileComplete(Boolean(data.user.age && data.user.preference));
  };

  const updatePrivateProfile = async (payload: {
    privateEmail?: string;
    privatePhone?: string;
    privateLocation?: string;
    privateNotes?: string;
  }) => {
    if (!token) throw new Error('Not authenticated');
    const data = await apiRequest<{ user: User; privateProfileComplete: boolean }>(
      '/profile/private',
      { method: 'PUT', body: JSON.stringify(payload) },
      token
    );
    setUser(data.user);
    setPrivateProfileComplete(Boolean(data.privateProfileComplete));
  };

  const updateContactPreferences = async (payload: { enabled: boolean; contacts: string[] }) => {
    if (!token) throw new Error('Not authenticated');
    const data = await apiRequest<{ enabled: boolean }>('/contacts/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, token);
    setConnectContactsEnabled(Boolean(data.enabled));
  };

  const upgradeMonthly = async () => {
    if (!token) throw new Error('Not authenticated');
    const data = await apiRequest<{ isPremium: boolean; premiumUntil: string | null }>(
      '/billing/upgrade-monthly',
      { method: 'POST' },
      token
    );
    setPremium({ isPremium: data.isPremium, premiumUntil: data.premiumUntil });
    await refreshMe();
  };

  const fetchCommunitySuggestions = async () => {
    if (!token) throw new Error('Not authenticated');
    try {
      const data = await apiRequest<{ prompt: string; suggestions: string[] }>(
        '/community/suggestions',
        {},
        token
      );
      return data;
    } catch {
      return null;
    }
  };

  const joinCommunity = async (communityLabel: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiRequest(
      '/community/join',
      {
        method: 'POST',
        body: JSON.stringify({ communityLabel })
      },
      token
    );
    await refreshMe();
  };

  const leaveCommunity = async () => {
    if (!token) throw new Error('Not authenticated');
    await apiRequest('/community/leave', { method: 'POST' }, token);
    await refreshMe();
  };

  const value = useMemo(
    () => ({
      loading,
      token,
      user,
      profileComplete,
      privateProfileComplete,
      termsAccepted,
      connectContactsEnabled,
      premium,
      scores,
      interpretations,
      signUp,
      login,
      acceptTerms,
      logout,
      deleteAccount,
      refreshMe,
      updateProfile,
      updatePrivateProfile,
      updateContactPreferences,
      upgradeMonthly,
      fetchCommunitySuggestions,
      joinCommunity,
      leaveCommunity,
      setScores,
      setInterpretations
    }),
    [loading, token, user, profileComplete, privateProfileComplete, termsAccepted, connectContactsEnabled, premium, scores, interpretations]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
