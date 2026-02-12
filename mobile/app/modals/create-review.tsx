import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { reviewsApi } from '@/lib/api/endpoints/reviews';
import { useImagePicker } from '@/lib/hooks/useImagePicker';
import { Rating, Button, Loading } from '@/components/ui';

export default function CreateReviewModal() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { pickImage } = useImagePicker();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (rating > 0 || comment.trim() || photos.length > 0) {
      Alert.alert(
        '¿Descartar reseña?',
        'Tenés cambios sin guardar. ¿Estás seguro de que querés descartarlos?',
        [
          { text: 'Seguir editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo podés agregar hasta 5 fotos por reseña.');
      return;
    }

    const result = await pickImage({
      quality: 0.8,
    });

    if (result) {
      setPhotos([...photos, result.uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Por favor seleccioná una calificación para enviar tu reseña.');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Error', 'Restaurante no especificado.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create review
      const response = await reviewsApi.create({
        restaurantId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (response.data && photos.length > 0) {
        // Upload photos
        for (const photo of photos) {
          await reviewsApi.uploadPhoto(response.data.id, photo);
        }
      }

      Alert.alert('Éxito', '¡Tu reseña ha sido enviada!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la reseña. Por favor intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = rating > 0 && !isSubmitting;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Escribir reseña</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Cómo fue tu experiencia?</Text>
            <Text style={styles.sectionSubtitle}>Tocá para calificar</Text>
            <View style={styles.ratingContainer}>
              <Rating
                value={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
              <Text style={styles.ratingText}>
                {rating === 0 && 'Tocá una estrella'}
                {rating === 1 && 'Malo'}
                {rating === 2 && 'Regular'}
                {rating === 3 && 'Bueno'}
                {rating === 4 && 'Muy bueno'}
                {rating === 5 && '¡Excelente!'}
              </Text>
            </View>
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compartí tus opiniones</Text>
            <Text style={styles.sectionSubtitle}>Opcional pero útil</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="¿Qué te gustó o no te gustó? ¿Qué platillos recomendarías?"
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{comment.length}/1000</Text>
          </View>

          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agregar fotos</Text>
            <Text style={styles.sectionSubtitle}>Hasta 5 fotos</Text>
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <Pressable
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close" size={14} color={colors.text} />
                  </Pressable>
                </View>
              ))}
              {photos.length < 5 && (
                <Pressable style={styles.addPhotoButton} onPress={handleAddPhoto}>
                  <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
                  <Text style={styles.addPhotoText}>Agregar</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title={isSubmitting ? 'Enviando...' : 'Enviar reseña'}
            fullWidth
            onPress={handleSubmit}
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
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
  closeButton: {
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  ratingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  commentInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    minHeight: 120,
  },
  charCount: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addPhotoText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});
