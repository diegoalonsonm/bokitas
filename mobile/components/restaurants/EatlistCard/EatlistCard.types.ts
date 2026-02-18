import { EatlistEntry } from '@/types';
import { ViewStyle } from 'react-native';

export interface EatlistCardProps {
    entry: EatlistEntry;
    onToggleVisited: () => void;
    onRemove: () => void;
    onPress: () => void;
    style?: ViewStyle;
    index?: number;
}
