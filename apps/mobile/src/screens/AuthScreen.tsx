import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Field, PrimaryButton, ScreenTitle, SecondaryButton, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useL10n } from '../lib/useL10n';
import { colors } from '../theme';

export function AuthScreen() {
  const { login, signUp } = useAuth();
  const { t } = useL10n();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email || !password || (mode === 'signup' && !name)) {
      setError(t('Please complete all required fields.', '请填写所有必填项。'));
      return;
    }
    if (mode === 'signup' && !agreedGuidelines) {
      setError('Please agree to the Terms & Community Guidelines.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp({ email: email.trim(), password, name: name.trim() });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Authentication failed', '认证失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle
        title={mode === 'signup' ? t('Create account', '创建账号') : t('Welcome back', '欢迎回来')}
        subtitle={t('Sign in to continue your EcoMind journey.', '登录后继续你的 EcoMind 旅程。')}
      />

      <Card>
        <View style={styles.modeSwitch}>
          <Pressable style={[styles.modeBtn, mode === 'signup' && styles.modeBtnActive]} onPress={() => setMode('signup')}>
            <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>{t('Sign up', '注册')}</Text>
          </Pressable>
          <Pressable style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]} onPress={() => setMode('login')}>
            <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>{t('Log in', '登录')}</Text>
          </Pressable>
        </View>
        {mode === 'signup' ? <Field label={t('Name', '姓名')} value={name} onChangeText={setName} placeholder={t('Your first name', '你的名字')} /> : null}
        <Field
          label={t('Email', '邮箱')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        <Field label={t('Password', '密码')} value={password} onChangeText={setPassword} placeholder={t('At least 6 characters', '至少 6 位字符')} />

        {mode === 'signup' ? (
          <View style={styles.guidelinesBlock}>
            <Text style={styles.guidelineTitle}>EcoMind Community Guidelines</Text>
            <Text style={styles.guidelineItem}>• No harassment, hate speech, or abusive behavior</Text>
            <Text style={styles.guidelineItem}>• No sexual or explicit content</Text>
            <Text style={styles.guidelineItem}>• No spam or misleading content</Text>
            <Text style={styles.guidelineItem}>• Users violating rules will be banned</Text>
            <Text style={styles.guidelineFooter}>We review all reported content within 24 hours and take appropriate action, including removing content and banning users.</Text>
            <Pressable style={styles.agreeRow} onPress={() => setAgreedGuidelines((prev) => !prev)}>
              <Text style={styles.agreeBox}>{agreedGuidelines ? '☑' : '☐'}</Text>
              <Text style={styles.agreeText}>I agree to the Terms & Community Guidelines</Text>
            </Pressable>
          </View>
        ) : null}

        {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}

        <PrimaryButton
          label={mode === 'signup' ? t('Create account', '创建账号') : t('Log in', '登录')}
          onPress={submit}
          loading={loading}
          disabled={mode === 'signup' && !agreedGuidelines}
        />
        <SecondaryButton
          label={
            mode === 'signup'
              ? t('Already have an account? Log in', '已有账号？去登录')
              : t('New here? Create account', '新用户？创建账号')
          }
          onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        />
      </Card>
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
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.bgAlt,
    borderRadius: 12,
    padding: 4,
    gap: 6
  },
  modeBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center'
  },
  modeBtnActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border
  },
  modeText: {
    color: colors.textMuted,
    fontWeight: '700'
  },
  modeTextActive: {
    color: colors.text
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2
  },
  agreeBox: {
    color: colors.text,
    fontSize: 18,
    width: 24
  },
  agreeText: {
    color: colors.text,
    flex: 1
  },
  guidelinesBlock: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
    padding: 12,
    gap: 4
  },
  guidelineTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16
  },
  guidelineItem: {
    color: colors.text,
    lineHeight: 22
  },
  guidelineFooter: {
    color: colors.textMuted,
    lineHeight: 20
  }
});
