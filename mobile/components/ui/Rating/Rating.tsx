import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/lib/constants';

export interface RatingProps {
  value: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function Rating({
  value,
  maxValue = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
}: RatingProps) {
  const starSize = sizeMap[size];
  const stars = [];

  for (let i = 1; i <= maxValue; i++) {
    const isFilled = i <= value;
    const isHalf = !isFilled && i - 0.5 <= value;

    stars.push(
      <Pressable
        key={i}
        onPress={() => interactive && onChange?.(i)}
        disabled={!interactive}
        style={styles.star}
      >
        <Ionicons
          name={isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline'}
          size={starSize}
          color={isFilled || isHalf ? colors.starFilled : colors.starEmpty}
        />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{stars}</View>
      {showValue && (
        <Text style={[styles.value, styles[`${size}Value`]]}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 1,
  },
  value: {
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  smValue: {
    fontSize: typography.sizes.xs,
  },
  mdValue: {
    fontSize: typography.sizes.sm,
  },
  lgValue: {
    fontSize: typography.sizes.md,
  },
});
