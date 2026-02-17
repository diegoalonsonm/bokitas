import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities — only fires on iOS for native feel.
 * Uses expo-haptics conditionally per building-native-ui guidelines.
 */

/** Light tap — tab switches, small toggles */
export function hapticLight(): void {
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
}

/** Medium tap — button presses, primary actions */
export function hapticMedium(): void {
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
}

/** Heavy tap — destructive actions, important confirmations */
export function hapticHeavy(): void {
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
}

/** Success notification — pull-to-refresh complete, successful action */
export function hapticSuccess(): void {
    if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
}

/** Warning notification */
export function hapticWarning(): void {
    if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
}

/** Error notification — failed actions */
export function hapticError(): void {
    if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
}

/** Selection changed — list selections, picker changes */
export function hapticSelection(): void {
    if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
    }
}
