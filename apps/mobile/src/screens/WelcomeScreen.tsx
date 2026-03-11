import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, ScreenTitle } from '../components/UI';
import { useL10n } from '../lib/useL10n';
import { colors } from '../theme';

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  const { t } = useL10n();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <ScreenTitle
          title="EcoMind"
          subtitle={t(
            'A reflection-first dating app that helps you connect through compatible personality, values, and communication style.',
            '一个以自我觉察为核心的交友应用，帮助你通过性格、价值观和沟通风格找到更契合的连接。'
          )}
        />
      </View>

      <Card>
        <Text style={styles.heading}>{t('How it works', '使用方式')}</Text>
        <Text style={styles.text}>{t('1. Create your account and basic profile.', '1. 创建账号并填写基础资料。')}</Text>
        <Text style={styles.text}>{t('2. Complete the EcoMind reflection test.', '2. 完成 EcoMind 测试。')}</Text>
        <Text style={styles.text}>{t('3. See your 8-dimension profile and resonance matches.', '3. 查看你的八维画像和高共鸣匹配。')}</Text>
        <Text style={styles.text}>{t('4. Start chatting in your social-dating space.', '4. 在社交聊天空间开始交流。')}</Text>
      </Card>

      <Card>
        <Text style={styles.notice}>
          {t(
            'This is a reflective tool, not a clinical diagnosis. There are no right answers, and you control what you share.',
            '这是一个自我反思工具，不是临床诊断。没有标准答案，你可以决定分享哪些内容。'
          )}
        </Text>
      </Card>

      <PrimaryButton label={t('Start', '开始')} onPress={onContinue} />
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
  hero: {
    borderWidth: 1,
    borderColor: '#ead8c7',
    borderRadius: 20,
    backgroundColor: colors.bgAlt,
    padding: 14
  },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.text
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  notice: {
    color: colors.textMuted,
    lineHeight: 21
  }
});
