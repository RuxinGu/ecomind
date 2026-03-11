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
            'Users must be 18 or older, provide accurate information, and follow community standards. Harassment, hate speech, coercion, or impersonation can result in account restrictions.',
            '用户需年满 18 岁，提供真实信息并遵守社区规范。骚扰、仇恨言论、胁迫或冒充行为可能导致账号受限。'
          )}
        </Text>
      </Card>

      <Card>
        <Text style={styles.heading}>{t('Community Guidelines', '社区规范')}</Text>
        <Text style={styles.text}>
          {t(
            'Respect consent and boundaries. Keep chat authentic and non-abusive. Use report and block tools whenever behavior is unsafe, manipulative, or inappropriate.',
            '请尊重同意与边界。保持真实、友善沟通。遇到不安全、操控或不当行为时，请及时使用举报和拉黑功能。'
          )}
        </Text>
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
