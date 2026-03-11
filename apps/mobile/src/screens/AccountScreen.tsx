import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Field, PrimaryButton, ProfileAvatar, ScreenTitle, SecondaryButton, uiStyles } from '../components/UI';
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

export function AccountScreen({ onBack }: { onBack: () => void }) {
  const { t } = useL10n();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [preference, setPreference] = useState(user?.preference || '');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageOption>(normalizeLanguage(user?.preferred_language));
  const [bio, setBio] = useState(user?.bio || '');
  const [defaultQuestionsInput, setDefaultQuestionsInput] = useState((user?.default_questions || []).join('\n'));
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const pickAvatar = async () => {
    setError('');
    setUploading(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('Permission needed', '需要权限'), t('Please allow Photos access to upload a profile picture.', '请允许访问相册以上传头像。'));
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

  const save = async () => {
    setSaved(false);
    setError('');
    const ageNum = Number(age);
    if (!name.trim()) {
      setError(t('Name is required.', '姓名为必填项。'));
      return;
    }
    if (age && Number.isNaN(ageNum)) {
      setError(t('Age must be a number.', '年龄必须是数字。'));
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        age: age ? ageNum : undefined,
        gender: gender.trim() || undefined,
        preference: preference.trim() || undefined,
        bio: bio.trim() || undefined,
        preferredLanguage: preferredLanguage.toLowerCase(),
        avatarUrl: avatarUrl.trim(),
        defaultQuestions: defaultQuestionsInput
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 5)
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not update account', '更新账号失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle title={t('Your Account', '我的账号')} subtitle={t('Manage your profile and picture.', '管理你的资料和头像。')} />

      <Card>
        <ProfileAvatar name={name || user?.name} avatarUrl={avatarUrl || null} size={84} />
        <View style={styles.avatarActions}>
          <Pressable style={styles.uploadBtn} onPress={pickAvatar} disabled={uploading}>
            <Text style={styles.uploadBtnText}>{uploading ? t('Opening...', '正在打开...') : t('Upload from Photos', '从相册上传')}</Text>
          </Pressable>
          {avatarUrl ? (
            <Pressable style={styles.removeBtn} onPress={() => setAvatarUrl('')}>
              <Text style={styles.removeBtnText}>{t('Remove photo', '移除照片')}</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.tagline}>{t('Your profile helps matching and trust-building.', '资料越完整，匹配和信任建立越高效。')}</Text>
      </Card>

      <Card>
        <Field label={t('Profile picture URL', '头像链接')} value={avatarUrl} onChangeText={setAvatarUrl} placeholder="https://..." />
        <Field label={t('Name', '姓名')} value={name} onChangeText={setName} placeholder={t('Display name', '显示名称')} />
        <Field label={t('Age', '年龄')} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="18+" />
        <Field label={t('Gender', '性别')} value={gender} onChangeText={setGender} placeholder={t('Optional', '可选')} />
        <Field label={t('Preference', '偏好')} value={preference} onChangeText={setPreference} placeholder={t('Dating preference', '交友偏好')} />
        <Text style={styles.fieldHeading}>{t('Preferred Language', '偏好语言')}</Text>
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
        <Field label={t('Bio', '自我介绍')} value={bio} onChangeText={setBio} placeholder={t('Tell people about you', '介绍一下你自己')} multiline />
        <Field
          label={t('Default questions (optional)', '默认问题（可选）')}
          value={defaultQuestionsInput}
          onChangeText={setDefaultQuestionsInput}
          placeholder={t('One question per line (max 5). Example: What is your ideal weekend?', '每行一个问题（最多5个）。示例：你理想的周末是什么样？')}
          multiline
        />
        {error ? <Text style={uiStyles.errorText}>{error}</Text> : null}
        {saved ? <Text style={styles.saved}>{t('Profile updated.', '资料已更新。')}</Text> : null}
        <PrimaryButton label={t('Save profile', '保存资料')} onPress={save} loading={loading} />
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
  email: {
    color: colors.textMuted
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  uploadBtn: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDeep,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '800'
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff'
  },
  removeBtnText: {
    color: colors.text,
    fontWeight: '700'
  },
  tagline: {
    color: colors.text,
    fontWeight: '600'
  },
  fieldHeading: {
    color: colors.text,
    fontWeight: '700'
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
  saved: {
    color: colors.accent,
    fontWeight: '700'
  }
});
