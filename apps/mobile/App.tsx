import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AccountScreen } from './src/screens/AccountScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatHistoryScreen } from './src/screens/ChatHistoryScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { CommunityChatScreen } from './src/screens/CommunityChatScreen';
import { LegalScreen } from './src/screens/LegalScreen';
import { PrivateProfileScreen } from './src/screens/PrivateProfileScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TestScreen } from './src/screens/TestScreen';
import { TermsConsentScreen } from './src/screens/TermsConsentScreen';
import type { Match } from './src/lib/types';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme';

function Shell() {
  const { loading, token, profileComplete, privateProfileComplete, termsAccepted, scores, refreshMe } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [view, setView] = useState<'auto' | 'home' | 'test' | 'results' | 'chat' | 'community' | 'settings' | 'legal' | 'account'>('auto');
  const [homeTab, setHomeTab] = useState<'matches' | 'chats'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [chatStarter, setChatStarter] = useState<string | null>(null);

  const hasAnyScore = useMemo(
    () => Object.values(scores || {}).some((value) => typeof value === 'number' || value === null),
    [scores]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!hasStarted) {
    return <WelcomeScreen onContinue={() => setHasStarted(true)} />;
  }

  if (!token) {
    return <AuthScreen />;
  }

  if (!profileComplete) {
    return <ProfileScreen />;
  }

  if (!privateProfileComplete) {
    return <PrivateProfileScreen />;
  }

  if (!termsAccepted) {
    return <TermsConsentScreen />;
  }

  if (view === 'test') {
    return <TestScreen onSubmitted={() => setView('home')} />;
  }

  if (view === 'chat') {
    return (
      <ChatScreen
        onBackToResults={() => {
          setHomeTab('chats');
          setView('home');
        }}
        onOpenSettings={() => setView('settings')}
        onOpenAccount={() => setView('account')}
        selectedMatch={selectedMatch}
        initialMessage={chatStarter}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsScreen
        onOpenLegal={() => setView('legal')}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'legal') {
    return <LegalScreen onBack={() => setView('settings')} />;
  }

  if (view === 'community') {
    return <CommunityChatScreen onBack={() => setView('home')} onOpenAccount={() => setView('account')} />;
  }

  if (view === 'account') {
    return <AccountScreen onBack={() => setView('home')} />;
  }

  if (!hasAnyScore) {
    return <TestScreen onSubmitted={async () => {
      await refreshMe();
      setView('home');
    }} />;
  }

  const renderHomeTab = () => {
    if (homeTab === 'chats') {
      return (
        <ChatHistoryScreen
          onOpenChat={(match) => {
            setSelectedMatch(match);
            setChatStarter(null);
            setView('chat');
          }}
          onOpenSettings={() => setView('settings')}
          onOpenAccount={() => setView('account')}
        />
      );
    }

    return (
      <ResultsScreen
        onOpenChat={(match, starter) => {
          setSelectedMatch(match);
          setChatStarter(starter || null);
          setView('chat');
        }}
        onRetake={() => setView('test')}
        onOpenSettings={() => setView('settings')}
        onOpenCommunity={() => setView('community')}
        onOpenAccount={() => setView('account')}
      />
    );
  };

  return (
    <View style={styles.homeShell}>
      <View style={styles.homeContent}>{renderHomeTab()}</View>
      <View style={styles.bottomNav}>
        <Pressable
          style={[styles.navItem, homeTab === 'matches' && styles.navItemActive]}
          onPress={() => setHomeTab('matches')}
        >
          <Text style={[styles.navIcon, homeTab === 'matches' && styles.navTextActive]}>✨</Text>
          <Text style={[styles.navText, homeTab === 'matches' && styles.navTextActive]}>Matches</Text>
        </Pressable>
        <Pressable
          style={[styles.navItem, homeTab === 'chats' && styles.navItemActive]}
          onPress={() => setHomeTab('chats')}
        >
          <Text style={[styles.navIcon, homeTab === 'chats' && styles.navTextActive]}>💬</Text>
          <Text style={[styles.navText, homeTab === 'chats' && styles.navTextActive]}>Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <Shell />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg
  },
  homeShell: {
    flex: 1
  },
  homeContent: {
    flex: 1
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10
  },
  navItem: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2
  },
  navItemActive: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border
  },
  navIcon: {
    fontSize: 18
  },
  navText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  navTextActive: {
    color: colors.text
  }
});
