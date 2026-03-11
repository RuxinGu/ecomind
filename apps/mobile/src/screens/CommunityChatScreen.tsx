import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, ProfileCornerButton, ScreenTitle, SecondaryButton } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { useL10n } from '../lib/useL10n';
import type { ChatMessage } from '../lib/types';
import { colors } from '../theme';

const cuteEmojis = ['😊', '🥰', '💖', '🌸', '✨', '🫶', '🐻', '😻', '🌷', '💫'];

export function CommunityChatScreen({
  onBack,
  onOpenAccount
}: {
  onBack: () => void;
  onOpenAccount: () => void;
}) {
  const { t } = useL10n();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    if (!token) return;
    const data = await apiRequest<{ communityLabel: string; messages: ChatMessage[] }>(
      '/community/messages',
      {},
      token
    );
    setMessages(data.messages || []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadMessages();
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : t('Could not load community chat', '无法加载社区聊天'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const timer = setInterval(() => {
      loadMessages().catch(() => {});
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [token]);

  const send = async () => {
    if (!token || (!text.trim() && !imageUrl)) return;
    setSending(true);
    setError('');
    try {
      await apiRequest(
        '/community/messages',
        {
          method: 'POST',
          body: JSON.stringify({ text: text.trim(), imageUrl: imageUrl || undefined })
        },
        token
      );
      setText('');
      setImageUrl(null);
      await loadMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not send message', '消息发送失败'));
    } finally {
      setSending(false);
    }
  };

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
        setImageUrl(`data:${mime};base64,${asset.base64}`);
      } else {
        Alert.alert(t('Upload failed', '上传失败'), t('Could not process this image. Please choose another photo.', '无法处理该图片，请选择其他照片。'));
      }
    } catch {
      Alert.alert(t('Upload failed', '上传失败'), t('Could not open your photo library.', '无法打开相册。'));
    } finally {
      setPickingImage(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View />
        <ProfileCornerButton name={user?.name} avatarUrl={user?.avatar_url} onPress={onOpenAccount} />
      </View>
      <ScreenTitle
        title={`${user?.community_label || t('Community', '社区')} ${t('Chat', '聊天')}`}
        subtitle={t('Connect with people sharing your language community.', '与同语言社区成员交流。')}
      />

      <Card>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ScrollView
          style={styles.listWrap}
          contentContainerStyle={styles.listContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {loading ? <Text style={styles.caption}>{t('Loading community chat...', '正在加载社区聊天...')}</Text> : null}
          {messages.map((message) => {
            const mine = message.sender_id === user?.id;
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.sender, mine && styles.mineText]}>{mine ? t('You', '你') : message.sender_name}</Text>
                {message.text ? <Text style={[styles.text, mine && styles.mineText]}>{message.text}</Text> : null}
                {message.image_url ? <Image source={{ uri: message.image_url }} style={styles.image} /> : null}
              </View>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRail}>
          {cuteEmojis.map((emoji) => (
            <Pressable key={emoji} style={styles.emojiChip} onPress={() => addEmoji(emoji)}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {imageUrl ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            <Pressable onPress={() => setImageUrl(null)}>
              <Text style={styles.removeText}>{t('Remove photo', '移除照片')}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.composerShell}>
          <Pressable style={styles.composerIconBtn} onPress={pickPhotoFromLibrary} disabled={pickingImage}>
            <Text style={styles.composerIconText}>{pickingImage ? '…' : '＋'}</Text>
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('Say hi to your community...', '和社区打个招呼吧...')}
            placeholderTextColor="#8b97a4"
            style={styles.composerInput}
            multiline
          />
          <Pressable
            style={[styles.sendBtn, (!text.trim() && !imageUrl) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim() && !imageUrl}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>

        {sending ? <Text style={styles.caption}>{t('Sending...', '发送中...')}</Text> : null}
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
  caption: {
    color: colors.textMuted
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  listWrap: {
    maxHeight: 380,
    borderWidth: 1,
    borderColor: '#e8dfcf',
    borderRadius: 14,
    backgroundColor: '#fffcf8'
  },
  listContent: {
    gap: 8,
    padding: 8
  },
  bubble: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 5,
    maxWidth: '88%'
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderColor: colors.accentDeep
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderColor: colors.border
  },
  sender: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  text: {
    color: colors.text,
    lineHeight: 20
  },
  mineText: {
    color: '#fff'
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#e5e7eb'
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600'
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
  photoInputRow: {
    marginTop: 8
  }
});
