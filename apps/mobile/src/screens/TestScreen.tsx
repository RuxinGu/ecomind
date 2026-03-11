import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, ScreenTitle, SecondaryButton, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { useL10n } from '../lib/useL10n';
import type { InterpretationsPayload } from '../lib/types';
import { colors } from '../theme';

type QuestionItem = {
  id: string;
  dimension: string;
  text: string;
};

export function TestScreen({ onSubmitted }: { onSubmitted: () => void }) {
  const { t } = useL10n();
  const { token, setScores, setInterpretations } = useAuth();
  const [formType, setFormType] = useState<'short' | 'long'>('short');
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      setResponses({});
      setIndex(0);
      try {
        const data = await apiRequest<{ items: QuestionItem[] }>(`/questionnaire/${formType}`, {}, token);
        if (mounted) setItems(data.items);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : t('Could not load questionnaire', '无法加载问卷'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [token, formType]);

  const current = items[index];
  const progress = items.length ? Math.round((index / items.length) * 100) : 0;

  const answeredCount = useMemo(
    () => Object.values(responses).filter((v) => typeof v === 'number').length,
    [responses]
  );

  const submit = async () => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const data = await apiRequest<{
        scores: Record<string, number | null>;
        interpretations: InterpretationsPayload;
      }>(
        '/questionnaire/submit',
        {
          method: 'POST',
          body: JSON.stringify({ formType, responses })
        },
        token
      );
      setScores(data.scores);
      setInterpretations(data.interpretations || null);
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not submit test', '无法提交测试'));
    } finally {
      setSaving(false);
    }
  };

  const setAnswer = (value: number) => {
    if (!current) return;
    setResponses((prev) => ({ ...prev, [current.id]: value }));
  };

  const skip = () => {
    if (index < items.length - 1) setIndex((v) => v + 1);
  };

  const next = () => {
    if (index < items.length - 1) setIndex((v) => v + 1);
  };

  const previous = () => {
    if (index > 0) setIndex((v) => v - 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle
        title={t('EcoMind Test', 'EcoMind 测试')}
        subtitle={t('Choose what feels most true most of the time. You can skip any question.', '请选择“多数时候最符合你”的选项。你可以跳过任意题目。')}
      />

      <Card>
        <View style={uiStyles.row}>
          <SecondaryButton label={t('Short form (36)', '短版（36题）')} onPress={() => setFormType('short')} />
          <SecondaryButton label={t('Long form (64)', '长版（64题）')} onPress={() => setFormType('long')} />
        </View>
        <Text style={styles.helper}>{t('Current form', '当前问卷')}: {formType === 'short' ? t('Short form', '短版') : t('Long form', '长版')}</Text>
      </Card>

      {loading ? (
        <Card>
          <Text style={styles.helper}>{t('Loading questionnaire...', '正在加载问卷...')}</Text>
        </Card>
      ) : current ? (
        <Card>
          <Text style={styles.progress}>{t('Progress', '进度')}: {progress}%</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.questionIndex}>
            {t('Question', '题目')} {index + 1} / {items.length}
          </Text>
          <Text style={styles.dimension}>{t('Dimension', '维度')} {current.dimension}</Text>
          <Text style={styles.question}>{current.text}</Text>

          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                style={[styles.scaleChip, responses[current.id] === value && styles.scaleChipActive]}
                onPress={() => setAnswer(value)}
              >
                <Text style={[styles.scaleChipText, responses[current.id] === value && styles.scaleChipTextActive]}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.legend}>{t('1 Not true for me · 5 Very true for me', '1 完全不符合 · 5 非常符合')}</Text>

          <View style={styles.navRow}>
            <SecondaryButton label={t('Back', '返回')} onPress={previous} />
            <SecondaryButton label={t('Skip', '跳过')} onPress={skip} />
            <SecondaryButton label={t('Next', '下一题')} onPress={next} />
          </View>

          <Text style={styles.helper}>{t('Answered', '已作答')}: {answeredCount}</Text>

          <PrimaryButton
            label={saving ? t('Saving...', '正在保存...') : t('Submit EcoMind', '提交 EcoMind')}
            onPress={submit}
            loading={saving}
            disabled={answeredCount < 16}
          />
          <Text style={styles.helper}>{t('Answer at least 16 items for a stable first profile.', '至少回答 16 题以生成较稳定的初始画像。')}</Text>
          {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}
        </Card>
      ) : (
        <Card>
          <Text style={styles.helper}>{t('No questionnaire available.', '暂无可用问卷。')}</Text>
        </Card>
      )}
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
  helper: {
    color: colors.textMuted,
    lineHeight: 21
  },
  progress: {
    color: colors.text,
    fontWeight: '700'
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#ebe5da',
    borderRadius: 999
  },
  progressBarFill: {
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 999
  },
  questionIndex: {
    color: colors.textMuted,
    fontSize: 13
  },
  dimension: {
    color: colors.accent,
    fontWeight: '700'
  },
  question: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700'
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  scaleChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  scaleChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  scaleChipText: {
    color: colors.text,
    fontWeight: '700'
  },
  scaleChipTextActive: {
    color: '#fff'
  },
  legend: {
    color: colors.textMuted,
    fontSize: 12
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  }
});
