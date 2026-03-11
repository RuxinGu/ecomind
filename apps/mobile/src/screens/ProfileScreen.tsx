import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Field, PrimaryButton, ProfileAvatar, ScreenTitle, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useL10n } from '../lib/useL10n';
import { colors } from '../theme';

const languageOptions = [
  'English',
  'Chinese',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Portuguese',
  'Arabic',
  'Hindi'
] as const;
type LanguageOption = typeof languageOptions[number];

function normalizeLanguage(value?: string | null): LanguageOption {
  const normalized = String(value || '').trim().toLowerCase();
  const found = languageOptions.find((lang) => lang.toLowerCase() === normalized);
  return found || 'English';
}

export function ProfileScreen() {
  const { t } = useL10n();
  const { user, updateProfile, updateContactPreferences, connectContactsEnabled, fetchCommunitySuggestions, joinCommunity } = useAuth();
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [preference, setPreference] = useState(user?.preference || '');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageOption>(normalizeLanguage(user?.preferred_language));
  const [bio, setBio] = useState(user?.bio || '');
  const [defaultQuestionsInput, setDefaultQuestionsInput] = useState((user?.default_questions || []).join('\n'));
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [connectContacts, setConnectContacts] = useState(connectContactsEnabled);
  const [contactsInput, setContactsInput] = useState('');
  const [communityPrompt, setCommunityPrompt] = useState<string | null>(null);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickAvatar = async () => {
    setError('');
    setUploading(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow Photos access to upload a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.25,
        base64: true
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset?.base64) {
        const mime = asset.mimeType || 'image/jpeg';
        setAvatarUrl(`data:${mime};base64,${asset.base64}`);
      } else {
        setError(t('Could not process this image. Please choose another photo.', '无法处理该图片，请选择其他照片。'));
      }
    } catch {
      setError(t('Could not open photo library.', '无法打开相册。'));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError('');
    const ageNum = Number(age);

    if (!age || Number.isNaN(ageNum)) {
      setError(t('Please enter a valid age.', '请输入有效年龄。'));
      return;
    }
    if (!preference.trim()) {
      setError(t('Please enter your relationship preference.', '请输入你的关系偏好。'));
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        age: ageNum,
        gender: gender.trim() || undefined,
        preference: preference.trim(),
        bio: bio.trim() || undefined,
        preferredLanguage: preferredLanguage.toLowerCase(),
        avatarUrl: avatarUrl || undefined,
        defaultQuestions: defaultQuestionsInput
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 5)
      });

      await updateContactPreferences({
        enabled: connectContacts,
        contacts: contactsInput
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      });

      const suggestions = await fetchCommunitySuggestions();
      if (suggestions?.suggestions?.length) {
        setCommunityPrompt(suggestions.prompt);
        setCommunityOptions(suggestions.suggestions);
      } else {
        setCommunityPrompt(null);
        setCommunityOptions([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not save profile', '无法保存资料'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle
        title={t('Quick profile', '快速资料')}
        subtitle={t('This helps us personalize your EcoMind experience and matching context.', '这将帮助我们个性化你的 EcoMind 体验与匹配。')}
      />

      <Card>
        <View style={styles.avatarRow}>
          <ProfileAvatar name={user?.name} avatarUrl={avatarUrl || null} size={66} />
          <View style={styles.avatarButtons}>
            <Pressable style={styles.uploadBtn} onPress={pickAvatar} disabled={uploading}>
              <Text style={styles.uploadBtnText}>{uploading ? t('Opening...', '正在打开...') : t('Upload photo', '上传照片')}</Text>
            </Pressable>
            {avatarUrl ? (
              <Pressable style={styles.clearBtn} onPress={() => setAvatarUrl('')}>
                <Text style={styles.clearBtnText}>{t('Remove', '移除')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Field label={t('Age', '年龄')} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="18+" />
        <Field label={t('Gender (optional)', '性别（可选）')} value={gender} onChangeText={setGender} placeholder={t('Woman, man, non-binary...', '女 / 男 / 非二元...')} />
        <Field
          label={t('Preference', '偏好')}
          value={preference}
          onChangeText={setPreference}
          placeholder={t('What kind of connection are you open to?', '你希望建立怎样的关系？')}
        />
        <Text style={styles.sectionTitle}>{t('Preferred Language', '偏好语言')}</Text>
        <View style={styles.langWrap}>
          {languageOptions.map((language) => (
            <Pressable
              key={language}
              style={[styles.langBtn, preferredLanguage === language && styles.langBtnActive]}
              onPress={() => setPreferredLanguage(language)}
            >
              <Text style={[styles.langText, preferredLanguage === language && styles.langTextActive]}>{language}</Text>
            </Pressable>
          ))}
        </View>
        <Field
          label={t('Bio (optional)', '自我介绍（可选）')}
          value={bio}
          onChangeText={setBio}
          placeholder={t('What helps you feel seen and understood?', '什么会让你感到被理解和被看见？')}
          multiline
        />
        <Field
          label={t('Default questions (optional)', '默认问题（可选）')}
          value={defaultQuestionsInput}
          onChangeText={setDefaultQuestionsInput}
          placeholder={t('One question per line (max 5). Example: What is your ideal weekend?', '每行一个问题（最多5个）。示例：你理想的周末是什么样？')}
          multiline
        />

        <Text style={styles.sectionTitle}>{t('Contact Discovery (optional)', '通讯录优先匹配（可选）')}</Text>
        <Text style={styles.helpText}>
          {t(
            'If enabled, people from your contacts (if they are on EcoMind) appear first in your match list. They will not be tagged as contacts.',
            '开启后，若通讯录联系人也在 EcoMind 中，他们会优先出现在你的匹配列表，但不会标记为联系人。'
          )}
        </Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleButton, connectContacts && styles.toggleActive]}
            onPress={() => setConnectContacts(true)}
          >
            <Text style={[styles.toggleText, connectContacts && styles.toggleTextActive]}>{t('Yes', '是')}</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, !connectContacts && styles.toggleActive]}
            onPress={() => setConnectContacts(false)}
          >
            <Text style={[styles.toggleText, !connectContacts && styles.toggleTextActive]}>{t('No', '否')}</Text>
          </Pressable>
        </View>
        {connectContacts ? (
          <Field
            label={t('Contacts (comma separated email/phone)', '联系人（邮箱/手机号，用逗号分隔）')}
            value={contactsInput}
            onChangeText={setContactsInput}
            placeholder="alex@email.com, +1 415 123 4567"
            multiline
          />
        ) : null}

        {communityPrompt ? (
          <View style={styles.communityPromptBox}>
            <Text style={styles.sectionTitle}>{communityPrompt}</Text>
            <View style={styles.communityButtons}>
              {communityOptions.map((option) => (
                <Pressable
                  key={option}
                  style={styles.communityBtn}
                  onPress={async () => {
                    try {
                      await joinCommunity(option);
                      setCommunityPrompt(null);
                      setCommunityOptions([]);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : t('Could not join community', '加入社区失败'));
                    }
                  }}
                >
                  <Text style={styles.communityBtnText}>{t('Join', '加入')} {option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}

        <PrimaryButton label={t('Save and continue', '保存并继续')} onPress={submit} loading={loading} />
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
  sectionTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatarButtons: {
    gap: 8
  },
  uploadBtn: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.accentDeep
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '800'
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff'
  },
  clearBtnText: {
    color: colors.text,
    fontWeight: '700'
  },
  helpText: {
    color: colors.textMuted,
    lineHeight: 20
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff'
  },
  toggleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDeep
  },
  toggleText: {
    color: colors.text,
    fontWeight: '700'
  },
  toggleTextActive: {
    color: '#fff'
  },
  langWrap: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  langBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  langBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDeep
  },
  langText: {
    color: colors.text,
    fontWeight: '700'
  },
  langTextActive: {
    color: '#fff'
  },
  communityPromptBox: {
    borderWidth: 1,
    borderColor: '#f1d6c0',
    backgroundColor: colors.bgAlt,
    borderRadius: 12,
    padding: 10,
    gap: 8
  },
  communityButtons: {
    gap: 8
  },
  communityBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentDeep
  },
  communityBtnText: {
    color: '#fff',
    fontWeight: '700'
  }
});
