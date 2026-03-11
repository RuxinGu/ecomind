import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Field, PrimaryButton, ScreenTitle, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useL10n } from '../lib/useL10n';
import { colors } from '../theme';

export function PrivateProfileScreen() {
  const { t } = useL10n();
  const { updatePrivateProfile, user } = useAuth();
  const [privateEmail, setPrivateEmail] = useState(user?.private_email || '');
  const [privatePhone, setPrivatePhone] = useState(user?.private_phone || '');
  const [privateLocation, setPrivateLocation] = useState(user?.private_location || '');
  const [privateNotes, setPrivateNotes] = useState(user?.private_notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await updatePrivateProfile({
        privateEmail: privateEmail.trim() || undefined,
        privatePhone: privatePhone.trim() || undefined,
        privateLocation: privateLocation.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not save private profile', '无法保存私密资料'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle
        title={t('Private Profile', '私密资料')}
        subtitle={t('Only unlocked after both people send flowers for 5 days. Fill this once now.', '双方互送鲜花满 5 天后解锁。请先填写一次。')}
      />

      <Card>
        <Field label={t('Private Email', '私密邮箱')} value={privateEmail} onChangeText={setPrivateEmail} placeholder="you@private.com" keyboardType="email-address" />
        <Field label={t('Private Phone', '私密电话')} value={privatePhone} onChangeText={setPrivatePhone} placeholder="+1 ..." />
        <Field label={t('Private Location', '私密位置')} value={privateLocation} onChangeText={setPrivateLocation} placeholder={t('City, State', '城市，地区')} />
        <Field
          label={t('Private Notes', '私密备注')}
          value={privateNotes}
          onChangeText={setPrivateNotes}
          placeholder={t('How you prefer deeper connection...', '你希望如何建立更深层连接...')}
          multiline
        />

        {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}
        <PrimaryButton label={t('Save private profile', '保存私密资料')} onPress={submit} loading={loading} />
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
  }
});
