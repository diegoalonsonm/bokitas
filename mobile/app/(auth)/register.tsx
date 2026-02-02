import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/lib/constants';
import { authApi } from '@/lib/api';
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '@/lib/utils';

interface FormData {
  nombre: string;
  primerapellido: string;
  segundoapellido: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  nombre?: string;
  primerapellido?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    primerapellido: '',
    segundoapellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validate all fields
    const nombreValidation = validateName(formData.nombre, 'First name');
    const apellidoValidation = validateName(formData.primerapellido, 'Last name');
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmValidation = validateConfirmPassword(formData.password, formData.confirmPassword);

    const newErrors: FormErrors = {};
    if (!nombreValidation.isValid) newErrors.nombre = nombreValidation.error;
    if (!apellidoValidation.isValid) newErrors.primerapellido = apellidoValidation.error;
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.error;
    if (!confirmValidation.isValid) newErrors.confirmPassword = confirmValidation.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        primerapellido: formData.primerapellido,
      });

      if (response.success) {
        Alert.alert(
          'Account Created',
          'Your account has been created successfully. Please login to continue.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      } else {
        Alert.alert('Registration Failed', response.error?.message || 'An error occurred');
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Bokitas today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textMuted}
                value={formData.nombre}
                onChangeText={(v) => updateField('nombre', v)}
                autoCapitalize="words"
                editable={!isLoading}
              />
              {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.primerapellido && styles.inputError]}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textMuted}
                value={formData.primerapellido}
                onChangeText={(v) => updateField('primerapellido', v)}
                autoCapitalize="words"
                editable={!isLoading}
              />
              {errors.primerapellido && (
                <Text style={styles.errorText}>{errors.primerapellido}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Second Last Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your second last name"
                placeholderTextColor={colors.textMuted}
                value={formData.segundoapellido}
                onChangeText={(v) => updateField('segundoapellido', v)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textMuted}
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor={colors.textMuted}
                value={formData.password}
                onChangeText={(v) => updateField('password', v)}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textMuted}
                value={formData.confirmPassword}
                onChangeText={(v) => updateField('confirmPassword', v)}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <Pressable
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
