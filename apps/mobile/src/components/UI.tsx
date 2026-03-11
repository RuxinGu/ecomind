import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.kickerBadge}>
        <Text style={styles.kickerText}>EcoMind</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !disabled && !loading ? styles.buttonPressed : null,
        (disabled || loading) && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[styles.input, multiline && styles.multiline]}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        multiline={multiline}
      />
    </View>
  );
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = 44
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
}) {
  const initial = String(name || '?').trim().charAt(0).toUpperCase() || '?';
  const radius = size / 2;
  return (
    <View style={[styles.avatarBase, { width: size, height: size, borderRadius: radius }]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: radius }} />
      ) : (
        <Text style={styles.avatarText}>{initial}</Text>
      )}
    </View>
  );
}

export function ProfileCornerButton({
  name,
  avatarUrl,
  onPress
}: {
  name?: string | null;
  avatarUrl?: string | null;
  onPress: () => void;
}) {
  const displayName = String(name || '').trim() || 'User';
  return (
    <Pressable style={styles.avatarButton} onPress={onPress}>
      <ProfileAvatar name={name} avatarUrl={avatarUrl} size={44} />
      <Text style={styles.avatarButtonText} numberOfLines={1}>{displayName}</Text>
    </Pressable>
  );
}

export const uiStyles = StyleSheet.create({
  errorText: { color: colors.danger, marginBottom: 10, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeText: { color: colors.accent, fontWeight: '700', fontSize: 12 }
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#8f7454',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2
  },
  headerWrap: { gap: 9 },
  kickerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warmSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f3d7c7',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  kickerText: {
    color: colors.warm,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 23
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentDeep,
    shadowColor: colors.accentDeep,
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  buttonPressed: {
    transform: [{ translateY: 1 }]
  },
  buttonDisabled: {
    opacity: 0.55
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: colors.bgAlt
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600'
  },
  fieldWrap: {
    gap: 6
  },
  fieldLabel: {
    color: colors.text,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.text,
    backgroundColor: '#fff',
    fontSize: 15
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top'
  },
  avatarBase: {
    backgroundColor: '#e7e0d4',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatarText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18
  },
  avatarButton: {
    alignItems: 'center',
    gap: 6
  },
  avatarButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  }
});
