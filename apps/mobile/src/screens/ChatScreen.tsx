import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, ProfileCornerButton, ScreenTitle, SecondaryButton } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { useL10n } from '../lib/useL10n';
import type { ChatMessage, Match } from '../lib/types';
import { colors } from '../theme';

const cuteEmojis = ['😊', '🥰', '💖', '🌸', '✨', '🫶', '🐻', '😻', '🌷', '💫'];
const badWords = ['fuck', 'sex', 'hate', 'kill'];

function buildMatchRoomId(myUserId: number, otherUserId: number) {
  const a = Math.min(myUserId, otherUserId);
  const b = Math.max(myUserId, otherUserId);
  return `match-${a}-${b}`;
}

function containsBadWord(text: string | null | undefined) {
  const value = String(text || '').toLowerCase();
  return badWords.some((word) => value.includes(word));
}

export function ChatScreen({
  onBackToResults,
  onOpenSettings,
  onOpenAccount,
  selectedMatch,
  initialMessage
}: {
  onBackToResults: () => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  selectedMatch: Match | null;
  initialMessage?: string | null;
}) {
  const { t } = useL10n();
  const { token, user, logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [flowerStatus, setFlowerStatus] = useState<{ mutualDays: number; unlockedPrivateInfo: boolean } | null>(null);
  const [privateProfile, setPrivateProfile] = useState<{
    privateEmail?: string | null;
    privatePhone?: string | null;
    privateLocation?: string | null;
    privateNotes?: string | null;
  } | null>(null);

  const roomId = useMemo(() => {
    if (!selectedMatch || !user) return null;
    return buildMatchRoomId(user.id, selectedMatch.id);
  }, [selectedMatch, user]);

  const loadMessages = async () => {
    if (!token || !roomId) return;
    const data = await apiRequest<{ messages: ChatMessage[] }>(`/chat/messages?roomId=${roomId}`, {}, token);
    setMessages(data.messages);
  };

  const loadFlowerStatus = async () => {
    if (!token || !selectedMatch) return;
    const data = await apiRequest<{
      mutualDays: number;
      unlockedPrivateInfo: boolean;
    }>(`/flowers/status/${selectedMatch.id}`, {}, token);
    setFlowerStatus(data);

    if (data.unlockedPrivateInfo) {
      const privateInfo = await apiRequest<{
        unlocked: boolean;
        profile?: {
          privateEmail?: string | null;
          privatePhone?: string | null;
          privateLocation?: string | null;
          privateNotes?: string | null;
        };
      }>(`/private-profile/${selectedMatch.id}`, {}, token);
      setPrivateProfile(privateInfo.profile || null);
    } else {
      setPrivateProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (roomId) await loadMessages();
        if (selectedMatch) await loadFlowerStatus();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const timer = setInterval(() => {
      if (roomId) loadMessages().catch(() => {});
      if (selectedMatch) loadFlowerStatus().catch(() => {});
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [token, roomId]);

  useEffect(() => {
    if (initialMessage && !text.trim()) {
      setText(initialMessage);
    }
  }, [initialMessage]);

  const addEmoji = (emoji: string) => {
    setText((prev) => `${prev}${prev ? ' ' : ''}${emoji}`);
  };

  const pickPhotoFromLibrary = async () => {
    setPickingImage(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('Permission needed', '需要权限'), t('Please allow photo library access to upload pictures.', '请允许访问相册以上传图片。'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.25,
        base64: true
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset?.base64) {
        const mime = asset.mimeType || 'image/jpeg';
        setImageUri(`data:${mime};base64,${asset.base64}`);
      } else {
        Alert.alert(t('Upload failed', '上传失败'), t('Could not process this image. Please choose another photo.', '无法处理该图片，请选择其他照片。'));
      }
    } catch {
      Alert.alert(t('Upload failed', '上传失败'), t('Could not open your photo library.', '无法打开相册。'));
    } finally {
      setPickingImage(false);
    }
  };

  const send = async () => {
    if (!token || !roomId) return;
    if (!text.trim() && !imageUri) return;

    setSending(true);
    try {
      await apiRequest(
        '/chat/messages',
        {
          method: 'POST',
          body: JSON.stringify({ roomId, text: text.trim(), imageUrl: imageUri })
        },
        token
      );
      setText('');
      setImageUri(null);
      await loadMessages();
    } catch (error) {
      Alert.alert(t('Send failed', '发送失败'), error instanceof Error ? error.message : t('Could not send message', '消息发送失败'));
    } finally {
      setSending(false);
    }
  };

  const sendFlower = async () => {
    if (!token || !selectedMatch) return;
    try {
      await apiRequest(
        '/flowers/send',
        {
          method: 'POST',
          body: JSON.stringify({ targetUserId: selectedMatch.id })
        },
        token
      );
      await loadFlowerStatus();
      Alert.alert(t('Flower sent', '送花成功'), t('You sent a flower today. Keep this up for 5 mutual days to unlock private profile.', '你今天已送出鲜花。双方连续互送 5 天即可解锁私密资料。'));
    } catch (error) {
      Alert.alert(t('Flower failed', '送花失败'), error instanceof Error ? error.message : t('Could not send flower', '无法送花'));
    }
  };

  const callMatch = async () => {
    const raw = privateProfile?.privatePhone?.trim();
    if (!raw) {
      Alert.alert(t('Call unavailable', '无法通话'), t('This user has not shared a phone number yet.', '对方尚未提供电话号码。'));
      return;
    }

    const normalized = raw.replace(/[^\d+]/g, '');
    const url = `tel:${normalized}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(t('Call unavailable', '无法通话'), t('Your device cannot place a phone call right now.', '当前设备暂时无法拨打电话。'));
      return;
    }
    await Linking.openURL(url);
  };

  const reportMessage = async (message: ChatMessage) => {
    if (!token) return;
    const response = await apiRequest<{ ok: boolean; action?: 'blocked_permanently' | 'queued_for_review' }>(
      '/safety/report',
      {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: message.sender_id,
          messageId: message.id,
          reason: 'Inappropriate or unsafe chat behavior'
        })
      },
      token
    );
    if (response.action === 'blocked_permanently') {
      Alert.alert(
        t('User permanently blocked', '用户已永久封禁'),
        t('This account violated community rules and has been permanently blocked.', '该账号违反社区规则，已被系统永久封禁。')
      );
      onBackToResults();
      return;
    }
    Alert.alert(
      t('Report submitted', '举报已提交'),
      t(
        'We review all reported content within 24 hours and remove inappropriate content. Users who violate guidelines may be banned.',
        '我们会在 24 小时内审核所有举报内容并移除不当内容。违反规范的用户可能会被封禁。'
      )
    );
  };

  const reportMatchUser = async () => {
    if (!token || !selectedMatch) return;
    const response = await apiRequest<{ ok: boolean; action?: 'blocked_permanently' | 'queued_for_review' }>(
      '/safety/report',
      {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: selectedMatch.id,
          reason: 'Private chat user reported for community guideline violation'
        })
      },
      token
    );
    if (response.action === 'blocked_permanently') {
      Alert.alert(
        t('User permanently blocked', '用户已永久封禁'),
        t('This account violated community rules and has been permanently blocked.', '该账号违反社区规则，已被系统永久封禁。')
      );
      onBackToResults();
      return;
    }
    Alert.alert(
      t('Report submitted', '举报已提交'),
      t(
        'We review all reported content within 24 hours and remove inappropriate content. Users who violate guidelines may be banned.',
        '我们会在 24 小时内审核所有举报内容并移除不当内容。违反规范的用户可能会被封禁。'
      )
    );
  };

  const blockUser = async (message: ChatMessage) => {
    if (!token) return;
    await apiRequest(
      '/safety/report',
      {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: message.sender_id,
          messageId: message.id,
          reason: 'User blocked for guideline violation'
        })
      },
      token
    );
    await apiRequest(
      '/safety/block',
      {
        method: 'POST',
        body: JSON.stringify({ blockedUserId: message.sender_id })
      },
      token
    );
    setMessages((prev) => prev.filter((item) => item.sender_id !== message.sender_id));
    Alert.alert(t('User blocked', '已拉黑用户'), `${message.sender_name}${t(' has been blocked.', ' 已被拉黑。')}`);
    onBackToResults();
  };

  if (!selectedMatch || !roomId) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={t('Private chat', '私聊')} subtitle={t('Choose a resonance match first.', '请先选择一个共鸣匹配。')} />
        <SecondaryButton label={t('Back to results', '返回结果页')} onPress={onBackToResults} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View />
        <ProfileCornerButton name={user?.name} avatarUrl={user?.avatar_url} onPress={onOpenAccount} />
      </View>
      <ScreenTitle
        title={`Soul Chat • ${selectedMatch.name}`}
        subtitle={`${selectedMatch.compatibility}% ${t('resonance', '共鸣')}。${t('Send flowers for 5 mutual days to unlock private profile.', '双方连续互送鲜花 5 天可解锁私密资料。')}`}
      />

      <Card>
        <View style={styles.reportRow}>
          <Pressable style={styles.reportBtn} onPress={reportMatchUser}>
            <Text style={styles.reportBtnText}>🚩 {t('Report user', '举报用户')}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRail}>
          <Pressable style={styles.flowerBtn} onPress={sendFlower}>
            <Text style={styles.flowerBtnText}>🌸 {t('Send Flower', '送花')}</Text>
          </Pressable>
          <View style={styles.statusPill}>
            <Text style={styles.flowerStatus}>
              {t('Mutual flower days', '互送天数')}: {flowerStatus?.mutualDays ?? 0}/5
            </Text>
          </View>
        </ScrollView>
        <Text style={styles.caption}>
          {t('If violated, system auto-checks and may permanently block the account.', '如违规，系统将自动审核并可能永久封禁账号。')}
        </Text>
        {privateProfile ? (
          <View style={styles.privateCard}>
            <Text style={styles.privateTitle}>{t('Private profile unlocked', '私密资料已解锁')}</Text>
            {privateProfile.privateEmail ? <Text style={styles.privateText}>Email: {privateProfile.privateEmail}</Text> : null}
            {privateProfile.privatePhone ? <Text style={styles.privateText}>Phone: {privateProfile.privatePhone}</Text> : null}
            {privateProfile.privateLocation ? <Text style={styles.privateText}>Location: {privateProfile.privateLocation}</Text> : null}
            {privateProfile.privateNotes ? <Text style={styles.privateText}>Notes: {privateProfile.privateNotes}</Text> : null}
            {privateProfile.privatePhone ? (
              <Pressable style={styles.callBtn} onPress={callMatch}>
                <Text style={styles.callBtnText}>📞 {t('Call now', '立即通话')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <Text style={styles.caption}>{t('Logged in as', '当前账号')}: {user?.name}</Text>
        <ScrollView
          style={styles.chatWrap}
          contentContainerStyle={styles.chatContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {loading ? <Text style={styles.caption}>{t('Loading chat...', '正在加载聊天...')}</Text> : null}
          {messages.map((message) => {
            const mine = user?.id === message.sender_id;
            const flagged = containsBadWord(message.text);
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.sender, mine && styles.mineText]}>{mine ? t('You', '你') : message.sender_name}</Text>
                {message.text ? <Text style={[styles.messageText, mine && styles.mineText]}>{message.text}</Text> : null}
                {message.image_url ? <Image source={{ uri: message.image_url }} style={styles.messageImage} /> : null}
                {flagged ? <Text style={styles.flagText}>{t('Potential guideline violation detected.', '检测到可能违反社区规范的内容。')}</Text> : null}
                {!mine ? (
                  <View style={styles.actionRow}>
                    <Pressable onPress={() => reportMessage(message)}>
                      <Text style={styles.actionText}>{t('Report', '举报')}</Text>
                    </Pressable>
                    <Pressable onPress={() => blockUser(message)}>
                      <Text style={styles.actionText}>{t('Block', '拉黑')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <Pressable onPress={() => setImageUri(null)}>
              <Text style={styles.removeText}>{t('Remove photo', '移除照片')}</Text>
            </Pressable>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRail}>
          {cuteEmojis.map((emoji) => (
            <Pressable key={emoji} style={styles.emojiChip} onPress={() => addEmoji(emoji)}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.composerShell}>
          <Pressable style={styles.composerIconBtn} onPress={pickPhotoFromLibrary} disabled={pickingImage}>
            <Text style={styles.composerIconText}>{pickingImage ? '…' : '＋'}</Text>
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('Write a message...', '输入消息...')}
            placeholderTextColor="#8b97a4"
            style={styles.composerInput}
            multiline
          />
          <Pressable
            style={[styles.sendBtn, (!text.trim() && !imageUri) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim() && !imageUri}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>

        {sending ? <Text style={styles.caption}>{t('Sending...', '发送中...')}</Text> : null}
      </Card>

      <SecondaryButton label={t('Back to matches', '返回匹配列表')} onPress={onBackToResults} />
      <SecondaryButton label={t('Safety & settings', '安全与设置')} onPress={onOpenSettings} />
      <SecondaryButton label={t('Logout', '退出登录')} onPress={logout} />
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
  caption: {
    color: colors.textMuted
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  quickActionsRail: {
    gap: 8,
    paddingRight: 8,
    alignItems: 'center'
  },
  reportBtn: {
    backgroundColor: '#fff0f0',
    borderColor: '#f3b7b7',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  reportBtnText: {
    color: '#9f1239',
    fontWeight: '800'
  },
  flowerBtn: {
    backgroundColor: colors.warmSoft,
    borderColor: '#f3d2bf',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  flowerBtnText: {
    color: colors.warm,
    fontWeight: '800'
  },
  flowerStatus: {
    color: '#6b7280',
    fontWeight: '700'
  },
  statusPill: {
    borderWidth: 1,
    borderColor: '#eadfcf',
    borderRadius: 999,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  privateCard: {
    borderWidth: 1,
    borderColor: '#cde7e4',
    borderRadius: 12,
    backgroundColor: '#ecf8f6',
    padding: 10,
    gap: 4
  },
  privateTitle: {
    color: colors.accentDeep,
    fontWeight: '800'
  },
  privateText: {
    color: '#0f4d4a'
  },
  callBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#e6f7f5',
    borderWidth: 1,
    borderColor: '#b7e3dd',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  callBtnText: {
    color: colors.accentDeep,
    fontWeight: '800'
  },
  chatWrap: {
    maxHeight: 420,
    borderWidth: 1,
    borderColor: '#e8dfcf',
    borderRadius: 14,
    backgroundColor: '#fffcf8'
  },
  chatContent: {
    gap: 8,
    padding: 8
  },
  bubble: {
    borderRadius: 16,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 0
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderColor: colors.accentDeep,
    maxWidth: '86%'
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderColor: '#eadfcf',
    maxWidth: '86%'
  },
  sender: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  messageText: {
    color: colors.text,
    lineHeight: 20,
    flexShrink: 1
  },
  mineText: {
    color: '#fff'
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#e5e7eb'
  },
  previewWrap: {
    borderWidth: 1,
    borderColor: '#eadfcf',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    alignItems: 'flex-start'
  },
  previewImage: {
    width: 130,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#e5e7eb'
  },
  removeText: {
    color: colors.danger,
    fontWeight: '700'
  },
  emojiRail: {
    gap: 6,
    paddingRight: 8
  },
  emojiChip: {
    backgroundColor: '#fff',
    borderColor: '#efd8c1',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  emojiText: {
    fontSize: 18
  },
  composerShell: {
    borderWidth: 1,
    borderColor: '#e5ddcf',
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },
  composerIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e6dfd2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgAlt
  },
  composerIconText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700'
  },
  composerInput: {
    flex: 1,
    maxHeight: 110,
    minHeight: 40,
    color: colors.text,
    paddingTop: 8,
    paddingBottom: 6
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent
  },
  sendBtnDisabled: {
    opacity: 0.55
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 17
  },
  actionRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap'
  },
  actionText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 12
  },
  flagText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700'
  }
});
