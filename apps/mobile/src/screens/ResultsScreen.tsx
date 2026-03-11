import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DimensionBandChip, DimensionBandIcon, scoreToBand, type DimensionCode } from '../components/DimensionIcons';
import { Card, ProfileAvatar, ProfileCornerButton, ScreenTitle, SecondaryButton, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { dimensionExplanations } from '../lib/dimensionExplanations';
import { useL10n } from '../lib/useL10n';
import type { DimensionInterpretation, Match } from '../lib/types';
import { colors } from '../theme';

const dimensionLabels: Record<string, string> = {
  A: 'Self-Reflection',
  B: 'Cognitive Exploration',
  C: 'Emotional Regulation',
  D: 'Secure Connection',
  E: 'Social Energy',
  F: 'Structure',
  G: 'Conflict Communication',
  H: 'Growth Alignment'
};

function displayLanguage(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'english') return 'English';
  if (normalized === 'chinese') return 'Chinese';
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function ResultsScreen({
  onOpenChat,
  onRetake,
  onOpenSettings,
  onOpenPremium,
  onOpenCommunity,
  onOpenAccount
}: {
  onOpenChat: (match: Match, starterQuestion?: string) => void;
  onRetake: () => void;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
  onOpenCommunity: () => void;
  onOpenAccount: () => void;
}) {
  const { t } = useL10n();
  const { token, user, scores, premium, upgradeMonthly, interpretations, connectContactsEnabled } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!token) return;
      try {
        const data = await apiRequest<{ matches: Match[] }>('/matches', {}, token);
        if (mounted) setMatches(data.matches);
      } catch (_e) {
        if (mounted) setMatches([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const complete = useMemo(() => Object.values(scores).some((value) => value !== null), [scores]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.topSettingsBtn} onPress={onOpenSettings}>
          <Text style={styles.topSettingsText}>{t('Settings', '设置')}</Text>
        </Pressable>
        <ProfileCornerButton name={user?.name} avatarUrl={user?.avatar_url} onPress={onOpenAccount} />
      </View>
      <View style={styles.hero}>
        <ScreenTitle
          title={t('Your EcoMind', '你的 EcoMind')}
          subtitle={t('Your resonance map is live. Premium unlocks unlimited chat with everyone.', '你的共鸣画像已生成。高级会员可与所有人无限聊天。')}
        />
        <Pressable
          style={[styles.upgradeButton, premium.isPremium && styles.upgradeButtonActive]}
          onPress={async () => {
            if (premium.isPremium) return;
            setUpgrading(true);
            try {
              await upgradeMonthly();
            } finally {
              setUpgrading(false);
            }
          }}
        >
          <Text style={styles.upgradeButtonText}>
            {premium.isPremium ? t('Soul Premium Active', '高级会员已开通') : upgrading ? t('Upgrading...', '升级中...') : t('Upgrade $2.89/month', '升级 $2.89/月')}
          </Text>
        </Pressable>
      </View>

      <Card>
        {!complete ? (
          <Text style={styles.helper}>{t('No score yet. Complete the questionnaire to unlock your profile.', '暂无分数。完成问卷后可解锁你的画像。')}</Text>
        ) : (
          Object.entries(dimensionLabels).map(([key, label]) => {
            const score = scores[key];
            const band = scoreToBand(score);
            const widthPercent: `${number}%` = typeof score === 'number' ? `${(score / 5) * 100}%` : '0%';
            const explanation = dimensionExplanations[key];
            const isExpanded = expandedDimension === key;
            return (
              <View key={key} style={styles.dimensionWrap}>
                <Pressable
                  style={styles.dimensionTapArea}
                  accessibilityRole="button"
                  accessibilityLabel={`${isExpanded ? 'Hide' : 'Open'} ${label} explanation`}
                  onPress={() => setExpandedDimension((prev) => (prev === key ? null : key))}
                >
                  <View style={styles.dimensionRow}>
                    <View style={styles.dimensionLabelWrap}>
                      <DimensionBandIcon
                        dimension={key as DimensionCode}
                        band={band}
                        label={`${label} ${band} band`}
                      />
                      <Text style={styles.dimensionLabel}>{label}</Text>
                    </View>
                    <Text style={styles.dimensionValue}>
                      {score === null || score === undefined ? 'N/A' : score.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: widthPercent }]} />
                  </View>
                  <Text style={styles.learnMoreText}>{isExpanded ? t('Hide details', '收起详情') : t('Tap to view details', '点击查看详情')}</Text>
                </Pressable>
                {isExpanded ? (
                  <View style={styles.explainerCard}>
                    <Text style={styles.explainerTitle}>{explanation.suggestedLabel}</Text>
                    <Text style={styles.explainerText}>{explanation.definition}</Text>
                    <Text style={styles.explainerSubhead}>{t('Typical indicators', '典型表现')}</Text>
                    {explanation.typicalIndicators.map((item) => (
                      <Text key={item} style={styles.explainerText}>• {item}</Text>
                    ))}
                    <Text style={styles.explainerSubhead}>{t('Why it matters', '为何重要')}</Text>
                    <Text style={styles.explainerText}>{explanation.whyItMatters}</Text>
                    <Text style={styles.explainerSubhead}>{t('Measurement caveat', '测量说明')}</Text>
                    <Text style={styles.explainerText}>{explanation.measurementCaveat}</Text>
                    <Text style={styles.explainerSubhead}>{t('Fairness note', '公平性提示')}</Text>
                    <Text style={styles.explainerText}>{explanation.fairnessNote}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </Card>

      {interpretations ? (
        <Card>
          <Text style={styles.heading}>{t('Interpretation Guardrails', '解读边界说明')}</Text>
          <Text style={styles.helper}>{interpretations.interpretationPolicy}</Text>
          {interpretations.guardrails.map((item) => (
            <Text key={item} style={styles.guardrailItem}>• {item}</Text>
          ))}
        </Card>
      ) : null}

      {interpretations ? (
        <Card>
          <Text style={styles.heading}>{t('Research-Grounded Insights', '研究依据洞察')}</Text>
          {interpretations.dimensions.map((item) => {
            const insight = item as DimensionInterpretation;
            if (insight.status === 'insufficient_data') {
              return (
                <View key={insight.dimension} style={styles.insightCard}>
                  <Text style={styles.insightTitle}>{insight.name}</Text>
                  <Text style={styles.helper}>{insight.message}</Text>
                </View>
              );
            }

            return (
              <View key={insight.dimension} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightTitle}>{insight.name}</Text>
                  <DimensionBandChip
                    dimension={insight.dimension as DimensionCode}
                    band={insight.band || scoreToBand(insight.score)}
                    title={insight.name}
                  />
                </View>
                <Text style={styles.insightBand}>{insight.headline} • {(insight.band || scoreToBand(insight.score)).toUpperCase()}</Text>
                <Text style={styles.helper}>{insight.researchMap}</Text>
                <Text style={styles.insightKeywords}>{t('Keywords', '关键词')}: {(insight.keywords || []).join(', ')}</Text>
                {(insight.growthActions || []).slice(0, 3).map((action) => (
                  <Text key={action} style={styles.actionItem}>• {action}</Text>
                ))}
                <Text style={styles.microcopy}>{insight.microcopy}</Text>
                <Text style={styles.caveat}>{t('Caveat', '提示')}: {insight.caveat}</Text>
              </View>
            );
          })}
        </Card>
      ) : null}

      <Card>
        <Text style={styles.heading}>{t('Soul resonance matches', '灵魂共鸣匹配')}</Text>
        <Text style={styles.helper}>
          {premium.isPremium
            ? t('Premium mode: chat is unlocked with everyone, no chat-rate cap.', '高级模式：可与所有人聊天，无消息频率限制。')
            : t('Free mode: chat unlocks for high-resonance matches.', '免费模式：仅高共鸣匹配可聊天。')}
        </Text>
        {connectContactsEnabled ? (
          <Text style={styles.helper}>{t('Contact discovery is on. Matching contacts are prioritized first.', '已开启通讯录优先匹配。')}</Text>
        ) : null}

        {loading ? <Text style={styles.helper}>{t('Finding matches...', '正在匹配中...')}</Text> : null}
        {!loading && matches.length === 0 ? (
          <Text style={styles.helper}>{t('No high-resonance matches yet. Retake later as more users complete tests.', '暂无高共鸣匹配，稍后可重测或等待更多用户完成测试。')}</Text>
        ) : null}

        {matches.slice(0, 8).map((match) => (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchTop}>
              <View style={styles.matchIdentity}>
                <ProfileAvatar name={match.name} avatarUrl={match.avatar_url} size={42} />
                <Text style={styles.matchName}>{match.name}</Text>
              </View>
              <View style={uiStyles.badge}>
                <Text style={uiStyles.badgeText}>{match.compatibility}% resonance</Text>
              </View>
            </View>
            <Text style={styles.helper}>
              {[match.age ? `${match.age}` : '', match.gender || ''].filter(Boolean).join(' · ')}
            </Text>
            {match.preferred_language ? (
              <Text style={styles.metaLabel}>{t('Language', '语言')}: {displayLanguage(match.preferred_language)}</Text>
            ) : null}
            {match.community_label ? (
              <Text style={styles.metaLabel}>{t('Community', '社区')}: {match.community_label}</Text>
            ) : null}
            {match.bio ? <Text style={styles.bio}>{match.bio}</Text> : null}
            {match.default_questions && match.default_questions.length ? (
              <View style={styles.questionsWrap}>
                <Text style={styles.questionHeading}>{t('Starter questions', '默认开场问题')}</Text>
                {match.default_questions.map((question) => (
                  <Pressable
                    key={`${match.id}-${question}`}
                    style={styles.questionChip}
                    onPress={() => onOpenChat(match, question)}
                  >
                    <Text style={styles.questionChipText}>“{question}”</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Pressable style={styles.chatButton} onPress={() => onOpenChat(match)}>
              <Text style={styles.chatButtonText}>{t('Open private chat', '进入私聊')}</Text>
            </Pressable>
          </View>
        ))}
      </Card>

      <SecondaryButton label={t('Retake test', '重新测试')} onPress={onRetake} />
      {user?.community_label ? (
        <SecondaryButton label={`${t('Open', '进入')} ${user.community_label}`} onPress={onOpenCommunity} />
      ) : null}
      <SecondaryButton label={t('Premium', '高级会员')} onPress={onOpenPremium} />
      <SecondaryButton label={t('Settings', '设置')} onPress={onOpenSettings} />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  topSettingsBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.bgAlt,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  topSettingsText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13
  },
  hero: {
    backgroundColor: colors.bgAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eed8c2',
    padding: 16,
    shadowColor: '#a66a3d',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  upgradeButton: {
    marginTop: 12,
    backgroundColor: colors.warm,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3522c'
  },
  upgradeButtonActive: {
    backgroundColor: colors.accentDeep
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '800'
  },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.text
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 21
  },
  guardrailItem: {
    color: colors.text,
    lineHeight: 20
  },
  dimensionWrap: {
    gap: 6,
    marginBottom: 8
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dimensionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '78%'
  },
  dimensionLabel: {
    color: colors.text,
    fontWeight: '600',
    maxWidth: '90%'
  },
  dimensionValue: {
    color: colors.accent,
    fontWeight: '700'
  },
  track: {
    height: 8,
    backgroundColor: '#ebe5da',
    borderRadius: 999
  },
  fill: {
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 999
  },
  dimensionTapArea: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#e8dfcf',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fffdfa',
    shadowColor: '#917253',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1
  },
  learnMoreText: {
    color: '#0f766e',
    fontWeight: '700',
    fontSize: 12
  },
  explainerCard: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e8dfcf',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    backgroundColor: '#fff'
  },
  explainerTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  explainerSubhead: {
    color: '#6b7280',
    fontWeight: '700'
  },
  explainerText: {
    color: colors.text,
    lineHeight: 19
  },
  matchCard: {
    borderWidth: 1,
    borderColor: '#f0e3d2',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    backgroundColor: '#fffcf8',
    shadowColor: '#997352',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1
  },
  matchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6
  },
  matchIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '72%'
  },
  matchName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  bio: {
    color: colors.text,
    lineHeight: 20
  },
  metaLabel: {
    color: '#8a5a00',
    fontWeight: '700'
  },
  chatButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentDeep
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '800'
  },
  questionsWrap: {
    gap: 6
  },
  questionHeading: {
    color: colors.text,
    fontWeight: '700'
  },
  questionChip: {
    borderWidth: 1,
    borderColor: '#e6d7c1',
    backgroundColor: '#fff6eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  questionChipText: {
    color: '#7a4a1f',
    lineHeight: 20
  },
  insightCard: {
    borderWidth: 1,
    borderColor: '#f0e3d2',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    backgroundColor: '#fff',
    shadowColor: '#917253',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  insightTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  insightBand: {
    color: '#0f766e',
    fontWeight: '700'
  },
  insightKeywords: {
    color: '#374151',
    fontWeight: '600'
  },
  actionItem: {
    color: colors.text,
    lineHeight: 20
  },
  microcopy: {
    color: '#0b7a75',
    lineHeight: 20,
    fontStyle: 'italic'
  },
  caveat: {
    color: '#7c2d12',
    lineHeight: 20
  }
});
