import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, PrimaryButton, ScreenTitle, SecondaryButton, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useL10n } from '../lib/useL10n';
import { colors } from '../theme';

export function SettingsScreen({
  onOpenLegal,
  onBack
}: {
  onOpenLegal: () => void;
  onBack: () => void;
}) {
  const { t } = useL10n();
  const { deleteAccount, logout, user, leaveCommunity } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const confirmDelete = () => {
    Alert.alert(t('Delete Account', '删除账号'), t('This permanently deletes your account data from EcoMind.', '这将永久删除你在 EcoMind 的账号数据。'), [
      { text: t('Cancel', '取消'), style: 'cancel' },
      {
        text: t('Delete', '删除'),
        style: 'destructive',
        onPress: async () => {
          setError('');
          setLoading(true);
          try {
            await deleteAccount();
          } catch (e) {
            setError(e instanceof Error ? e.message : t('Could not delete account', '无法删除账号'));
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle title={t('Settings', '设置')} subtitle={t('Manage safety tools, legal information, and your account.', '管理安全工具、法律信息和账号。')} />

      <Card>
        <PrimaryButton label={t('Open legal pages', '查看法律页面')} onPress={onOpenLegal} />
        {user?.community_label ? <SecondaryButton label={`${t('Leave', '退出')} ${user.community_label}`} onPress={leaveCommunity} /> : null}
        <SecondaryButton label={t('Logout', '退出登录')} onPress={logout} />
      </Card>

      <Card>
        <Text style={styles.heading}>{t('Account Deletion', '账号删除')}</Text>
        <Text style={styles.helper}>
          {t('You can permanently delete your account directly in-app to comply with App Store requirements.', '你可以在应用内直接永久删除账号，以符合 App Store 要求。')}
        </Text>
        {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}
        <PrimaryButton label={t('Delete my account', '删除我的账号')} onPress={confirmDelete} loading={loading} />
      </Card>

      <SecondaryButton label={t('Back', '返回')} onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: colors.bg,
    flexGrow: 1
  },
  heading: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 21
  }
});
