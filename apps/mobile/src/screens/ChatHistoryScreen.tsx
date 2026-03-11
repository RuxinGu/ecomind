import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ProfileAvatar, ProfileCornerButton, ScreenTitle } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { useL10n } from '../lib/useL10n';
import type { ChatRoom, Match } from '../lib/types';
import { colors } from '../theme';

export function ChatHistoryScreen({
  onOpenChat,
  onOpenSettings,
  onOpenAccount
}: {
  onOpenChat: (match: Match) => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
}) {
  const { t } = useL10n();
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!token) return;
      try {
        const data = await apiRequest<{ rooms: ChatRoom[] }>('/chat/rooms', {}, token);
        if (mounted) setRooms(data.rooms || []);
      } catch {
        if (mounted) setRooms([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.topSettingsBtn} onPress={onOpenSettings}>
          <Text style={styles.topSettingsText}>{t('Settings', '设置')}</Text>
        </Pressable>
        <ProfileCornerButton name={user?.name} avatarUrl={user?.avatar_url} onPress={onOpenAccount} />
      </View>

      <ScreenTitle
        title={t('Chat history', '聊天记录')}
        subtitle={t('Find your previous private chats quickly.', '快速找到你之前的私聊记录。')}
      />

      <Card>
        {loading ? <Text style={styles.helper}>{t('Loading chat...', '正在加载聊天...')}</Text> : null}
        {!loading && rooms.length === 0 ? (
          <Text style={styles.helper}>{t('No chat history yet. Start from Matches tab.', '暂无聊天记录。先在匹配页开始聊天。')}</Text>
        ) : null}

        {rooms.map((room) => (
          <Pressable key={room.roomId} style={styles.roomCard} onPress={() => onOpenChat(room.match)}>
            <View style={styles.roomTop}>
              <View style={styles.roomIdentity}>
                <ProfileAvatar name={room.match.name} avatarUrl={room.match.avatar_url} size={44} />
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.match.name}</Text>
                  <Text style={styles.roomMeta}>{room.match.compatibility}% {t('resonance', '共鸣')}</Text>
                </View>
              </View>
              <Text style={styles.timeText}>{new Date(room.lastMessage.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={2}>
              {room.lastMessage.text || t('Sent a photo', '发送了一张图片')}
            </Text>
          </Pressable>
        ))}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  topSettingsBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.bgAlt,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  topSettingsText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 20
  },
  roomCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 12,
    gap: 8
  },
  roomTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  roomIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0
  },
  roomInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  roomName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16
  },
  roomMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12
  },
  lastMessage: {
    color: colors.text,
    lineHeight: 20
  }
});
