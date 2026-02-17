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
  Image,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Link, router, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';
import { validateEmail, validatePassword } from '@/lib/utils';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        password: passwordValidation.error,
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace('/(tabs)' as Href);
    } catch (error) {
      Alert.alert(
        'Error al iniciar sesión',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      await loginWithGoogle();
      router.replace('/(tabs)' as Href);
    } catch (error) {
      // Don't show alert if user cancelled the sign in flow
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (!errorMessage.includes('sign in was cancelled') && !errorMessage.includes('Canceled')) {
        Alert.alert(
          'Error al iniciar sesión con Google',
          errorMessage
        );
      }
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
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Ingresa tu correo electrónico"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            </Link>

            <Pressable
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              )}
            </Pressable>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o continúa con</Text>
              <View style={styles.separatorLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.googleButtonPressed,
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <AntDesign name="google" size={20} color="#EA4335" />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Crear cuenta</Text>
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
    paddingVertical: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
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
  forgotPassword: {
    alignSelf: 'flex-end', // Aligns to the right
    marginBottom: spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  separatorText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  googleButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  googleButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
    paddingTop: spacing.xxl,
  },
  footerText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
