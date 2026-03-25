import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, PrimaryButton, ScreenTitle } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export function TermsConsentScreen() {
  const { acceptTerms } = useAuth();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!checked) {
      setError('Please agree to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await acceptTerms();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle
        title="Terms & Community Guidelines"
        subtitle="You must accept these rules before accessing chats and user-generated content."
      />
      <Card>
        <Text style={styles.item}>• No harassment, hate speech, or abusive behavior</Text>
        <Text style={styles.item}>• No sexual or explicit content</Text>
        <Text style={styles.item}>• No spam or misleading content</Text>
        <Text style={styles.item}>• Users violating rules will be banned</Text>
        <Text style={styles.item}>
          • We review all reported content within 24 hours and take appropriate action, including removing content and banning users.
        </Text>

        <Pressable style={styles.checkRow} onPress={() => setChecked((prev) => !prev)}>
          <Text style={styles.checkBox}>{checked ? '☑' : '☐'}</Text>
          <Text style={styles.checkLabel}>I agree to the Terms & Community Guidelines</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Continue" onPress={submit} disabled={!checked} loading={loading} />
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
  item: {
    color: colors.text,
    lineHeight: 22
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  checkBox: {
    color: colors.text,
    fontSize: 18,
    width: 24
  },
  checkLabel: {
    color: colors.text,
    flex: 1
  },
  error: {
    color: colors.danger,
    fontWeight: '600'
  }
});
