import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, ScreenTitle, SecondaryButton, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { useL10n } from '../lib/useL10n';
import type { PremiumEvent } from '../lib/types';
import { colors } from '../theme';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function PremiumScreen({ onBack }: { onBack: () => void }) {
  const { t } = useL10n();
  const { token, premium, upgradeMonthly, refreshMe } = useAuth();
  const [events, setEvents] = useState<PremiumEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    if (!token) return;
    const data = await apiRequest<{ events: PremiumEvent[] }>('/billing/history', {}, token);
    setEvents(data.events || []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadHistory();
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : t('Could not load billing history', '无法加载账单记录'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const buyMonthly = async () => {
    setActionLoading(true);
    setError('');
    try {
      await upgradeMonthly();
      await refreshMe();
      await loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Upgrade failed', '升级失败'));
    } finally {
      setActionLoading(false);
    }
  };

  const restore = async () => {
    if (!token) return;
    setActionLoading(true);
    setError('');
    try {
      const data = await apiRequest<{ restored: boolean; message?: string }>(
        '/billing/restore',
        { method: 'POST' },
        token
      );
      if (!data.restored && data.message) setError(data.message);
      await refreshMe();
      await loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Restore failed', '恢复失败'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle
        title={t('Soul Premium', 'Soul 高级会员')}
        subtitle={t('Unlimited chats with everyone, no free-tier message caps, and premium resonance mode.', '可与所有人无限聊天，无免费次数限制，并开启高级共鸣模式。')}
      />

      <Card>
        <Text style={styles.planName}>{t('Soul Premium Monthly', 'Soul 月度会员')}</Text>
        <Text style={styles.price}>$2.89 / month</Text>
        <Text style={styles.helper}>{t('Status', '状态')}: {premium.isPremium ? t('Active', '已开通') : t('Free', '免费')}</Text>
        {premium.premiumUntil ? <Text style={styles.helper}>{t('Valid until', '有效期至')}: {formatDate(premium.premiumUntil)}</Text> : null}

        {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}

        <PrimaryButton
          label={premium.isPremium ? t('Extend 30 days', '续费 30 天') : t('Upgrade now', '立即升级')}
          onPress={buyMonthly}
          loading={actionLoading}
        />
        <SecondaryButton label={t('Restore purchases', '恢复购买')} onPress={restore} />
      </Card>

      <Card>
        <Text style={styles.historyTitle}>{t('Purchase history', '购买记录')}</Text>
        {loading ? <Text style={styles.helper}>{t('Loading history...', '正在加载记录...')}</Text> : null}
        {!loading && events.length === 0 ? <Text style={styles.helper}>{t('No purchases yet.', '暂无购买记录。')}</Text> : null}

        {events.map((event) => (
          <View key={event.id} style={styles.historyRow}>
            <Text style={styles.historyType}>{event.event_type}</Text>
            <Text style={styles.historyMeta}>
              {event.amount_usd ? `$${event.amount_usd.toFixed(2)}` : '$0.00'} · {formatDate(event.created_at)}
            </Text>
          </View>
        ))}
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
  planName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 20
  },
  price: {
    color: '#92400e',
    fontWeight: '900',
    fontSize: 28
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 21
  },
  historyTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17
  },
  historyRow: {
    borderWidth: 1,
    borderColor: '#f0e3d2',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    gap: 4
  },
  historyType: {
    color: colors.text,
    fontWeight: '700'
  },
  historyMeta: {
    color: colors.textMuted
  }
});
