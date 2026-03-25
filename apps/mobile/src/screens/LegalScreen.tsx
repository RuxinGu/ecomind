import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card, ScreenTitle, SecondaryButton } from '../components/UI';
import { useL10n } from '../lib/useL10n';
import { colors } from '../theme';

export function LegalScreen({ onBack }: { onBack: () => void }) {
  const { t } = useL10n();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle title={t('Legal & Safety', '法律与安全')} subtitle={t('Core policy pages required for app launch and user trust.', '应用上线与用户信任所需的核心政策页面。')} />

      <Card>
        <Text style={styles.heading}>{t('Privacy Policy', '隐私政策')}</Text>
        <Text style={styles.text}>
          {t(
            'EcoMind collects account details, profile information, reflection responses, and chat content to provide matching and communication features. We never present test results as diagnosis.',
            'EcoMind 会收集账号信息、个人资料、测试作答与聊天内容，以提供匹配和沟通功能。我们不会将测试结果作为临床诊断。'
          )}
        </Text>
      </Card>

      <Card>
        <Text style={styles.heading}>{t('Terms of Use', '使用条款')}</Text>
        <Text style={styles.text}>
          {t(
            'Users must be 18 or older, provide accurate information, and follow community standards. We have zero tolerance for objectionable content and abusive users. Harassment, hate speech, coercion, or impersonation can result in immediate account restrictions or bans.',
            '用户需年满 18 岁，提供真实信息并遵守社区规范。我们对不当内容和滥用用户零容忍。骚扰、仇恨言论、胁迫或冒充行为可能导致账号立即受限或封禁。'
          )}
        </Text>
      </Card>

      <Card>
        <Text style={styles.heading}>{t('Community Guidelines', '社区规范')}</Text>
        <Text style={styles.text}>• No harassment, hate speech, or abusive behavior</Text>
        <Text style={styles.text}>• No sexual or explicit content</Text>
        <Text style={styles.text}>• No spam or misleading content</Text>
        <Text style={styles.text}>• Users violating rules will be banned</Text>
        <Text style={styles.text}>• We review all reported content within 24 hours and take appropriate action, including removing content and banning users.</Text>
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
    fontWeight: '800',
    fontSize: 17
  },
  text: {
    color: colors.text,
    lineHeight: 22
  }
});
