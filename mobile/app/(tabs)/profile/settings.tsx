import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { useAuth } from '@/lib/hooks';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui';

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  color?: string;
};

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Type DELETE to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await usersApi.delete(user!.id);
                      await logout();
                      router.replace('/(auth)/welcome');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@bokitas.app');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://bokitas.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://bokitas.app/terms');
  };

  const accountSettings: SettingItem[] = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      description: 'Change your name, photo, and more',
      onPress: () => router.push('/(tabs)/profile/edit'),
    },
    {
      icon: 'lock-closed-outline',
      label: 'Change Password',
      description: 'Update your password',
      onPress: () => Alert.alert('Coming Soon', 'Password change feature coming soon!'),
    },
  ];

  const preferenceSettings: SettingItem[] = [
    {
      icon: 'notifications-outline',
      label: 'Push Notifications',
      description: 'Receive updates about your reviews',
      toggle: true,
      value: notifications,
      onToggle: setNotifications,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: handleContact,
    },
    {
      icon: 'document-text-outline',
      label: 'Privacy Policy',
      onPress: handlePrivacy,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Terms of Service',
      onPress: handleTerms,
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      icon: 'log-out-outline',
      label: 'Sign Out',
      onPress: handleLogout,
      color: colors.error,
    },
    {
      icon: 'trash-outline',
      label: 'Delete Account',
      description: 'Permanently delete your account',
      onPress: handleDeleteAccount,
      color: colors.error,
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <Pressable
      key={index}
      style={[styles.settingItem, !isLast && styles.settingItemBorder]}
      onPress={item.onPress}
      disabled={!!item.toggle}
    >
      <View style={[styles.settingIcon, item.color && { backgroundColor: item.color + '20' }]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.color || colors.text}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, item.color && { color: item.color }]}>
          {item.label}
        </Text>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>
      {item.toggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.surfaceBorder, true: colors.primary + '80' }}
          thumbColor={item.value ? colors.primary : colors.textMuted}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </Pressable>
  );

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) =>
          renderSettingItem(item, index, index === items.length - 1)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderSection('Account', accountSettings)}
        {renderSection('Preferences', preferenceSettings)}
        {renderSection('Support', supportSettings)}
        {renderSection('', dangerSettings)}

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Bokitas v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ in Costa Rica</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  versionSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
