import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({
  text,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },

  // Sizes
  sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  md: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
  },

  // Variants
  default: {
    backgroundColor: colors.surfaceElevated,
  },
  primary: {
    backgroundColor: colors.primary + '20', // 20% opacity
  },
  success: {
    backgroundColor: colors.success + '20',
  },
  warning: {
    backgroundColor: colors.warning + '20',
  },
  error: {
    backgroundColor: colors.error + '20',
  },

  // Text base
  text: {
    fontWeight: typography.weights.medium,
  },

  // Text sizes
  smText: {
    fontSize: typography.sizes.xs,
  },
  mdText: {
    fontSize: typography.sizes.sm,
  },

  // Text colors
  defaultText: {
    color: colors.textSecondary,
  },
  primaryText: {
    color: colors.primary,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
});
