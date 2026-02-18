import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { Rating, Badge } from '@/components/ui';
import { EatlistCardProps } from './EatlistCard.types';

const PLACEHOLDER_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

export function EatlistCard({
    entry,
    onToggleVisited,
    onRemove,
    onPress,
    style,
    index = 0,
}: EatlistCardProps) {
    const { restaurant, hasBeenFlag } = entry;

    if (!restaurant) return null;

    const imageSource = restaurant.photoUrl || restaurant.photos?.[0] || null;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(400).springify()}
            layout={Layout.springify()}
            style={[styles.container, style]}
        >
            <Pressable
                style={({ pressed }) => [styles.contentContainer, pressed && styles.pressed]}
                onPress={onPress}
            >
                {/* Image Section */}
                <Image
                    source={imageSource}
                    placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />

                {/* Info Section */}
                <View style={styles.info}>
                    <View style={styles.header}>
                        <Text style={styles.name} numberOfLines={1}>
                            {restaurant.name}
                        </Text>
                        {hasBeenFlag && (
                            <View style={styles.visitedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                <Text style={styles.visitedText}>Visitado</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.category} numberOfLines={1}>
                        {restaurant.foodTypes?.map((ft) => ft.name).join(', ') || 'Restaurante'}
                    </Text>

                    <View style={styles.ratingRow}>
                        <Rating value={restaurant.averageRating || 0} size="sm" showValue />
                        <Text style={styles.reviewsText}>
                            • {restaurant.reviewCount || 0} reseñas
                        </Text>
                    </View>
                </View>
            </Pressable>

            {/* Actions Footer */}
            <View style={styles.actionsFooter}>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.actionButtonRemove,
                        pressed && styles.actionButtonPressed,
                    ]}
                    onPress={onRemove}
                    hitSlop={8}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Eliminar</Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.actionButtonCheck,
                        pressed && styles.actionButtonPressed,
                        hasBeenFlag && styles.actionButtonActive,
                    ]}
                    onPress={onToggleVisited}
                    hitSlop={8}
                >
                    <Ionicons
                        name={hasBeenFlag ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                        size={18}
                        color={hasBeenFlag ? colors.textSecondary : colors.primary}
                    />
                    <Text
                        style={[
                            styles.actionText,
                            { color: hasBeenFlag ? colors.textSecondary : colors.primary },
                        ]}
                    >
                        {hasBeenFlag ? 'Desmarcar' : 'Marcar visitado'}
                    </Text>
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderCurve: 'continuous',
        marginBottom: spacing.md,
        overflow: 'hidden',
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    contentContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
    },
    pressed: {
        opacity: 0.9,
        backgroundColor: colors.surfaceElevated,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceElevated,
        borderCurve: 'continuous',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.xs,
    },
    name: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.text,
        flex: 1,
    },
    visitedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.success + '15', // 15% opacity
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 100,
    },
    visitedText: {
        fontSize: 10,
        fontWeight: typography.weights.medium,
        color: colors.success,
    },
    category: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    reviewsText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginLeft: 4,
    },

    // Actions Footer
    actionsFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
        backgroundColor: colors.surface, // slightly distinct if needed, or same
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    actionButtonRemove: {
        // maybe left side needs specific styles?
    },
    actionButtonCheck: {
        // right side
    },
    actionButtonPressed: {
        backgroundColor: colors.surfaceElevated,
    },
    actionButtonActive: {
        // specific style when active
    },
    actionText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    divider: {
        width: 1,
        backgroundColor: colors.surfaceBorder,
        marginVertical: 8,
    },
});
