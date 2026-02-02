import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/lib/constants';
import { useAuth, useImagePicker } from '@/lib/hooks';
import { usersApi } from '@/lib/api';
import { Avatar, Button, Input, Loading } from '@/components/ui';
import { validateName } from '@/lib/utils';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { pickImage, isLoading: isPickingImage } = useImagePicker();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});

  const handleBack = () => {
    router.back();
  };

  const handlePickPhoto = async () => {
    const result = await pickImage({
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result) {
      try {
        setIsLoading(true);
        const response = await usersApi.uploadPhoto(user!.id, result.uri);
        if (response.data?.photoUrl) {
          setPhotoUrl(response.data.photoUrl);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to upload photo. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async () => {
    // Validate
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setErrors({ name: nameValidation.error });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Split name into parts for API (expects Spanish field names)
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await usersApi.update(user!.id, {
        nombre: firstName,
        primerapellido: lastName || firstName, // Use first name as last if only one name given
      });
      
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: handleBack },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickPhoto} disabled={isLoading || isPickingImage}>
              <Avatar
                source={photoUrl}
                name={name}
                size="xl"
                showBorder
              />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={16} color={colors.text} />
              </View>
            </Pressable>
            <Pressable onPress={handlePickPhoto} disabled={isLoading || isPickingImage}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <Input
              label="Username"
              placeholder="username (optional)"
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              error={errors.username}
              autoCapitalize="none"
              hint="Only letters, numbers, and underscores"
              editable={!isLoading}
            />

            <View style={styles.emailField}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.emailValue}>{user.email}</Text>
              <Text style={styles.emailHint}>Email cannot be changed</Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title="Save Changes"
            fullWidth
            onPress={handleSave}
            isLoading={isLoading}
            isDisabled={!name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  changePhotoText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  emailField: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  emailValue: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  emailHint: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});
