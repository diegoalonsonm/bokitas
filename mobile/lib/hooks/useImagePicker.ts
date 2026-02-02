import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { config } from '@/lib/constants';

interface ImagePickerOptions {
  aspect?: [number, number];
  maxWidth?: number;
  quality?: number;
}

interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/**
 * Hook for picking and processing images
 */
export function useImagePicker(defaultOptions: ImagePickerOptions = {}) {
  const [image, setImage] = useState<PickedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (
    uri: string, 
    options: ImagePickerOptions = {}
  ): Promise<PickedImage> => {
    const maxWidth = options.maxWidth || defaultOptions.maxWidth || config.imageMaxWidth;
    const quality = options.quality || defaultOptions.quality || config.imageCompressQuality;

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  };

  const pickImage = async (options: ImagePickerOptions = {}): Promise<PickedImage | null> => {
    setIsLoading(true);
    setError(null);

    const aspect = options.aspect || defaultOptions.aspect || [1, 1];

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access gallery denied');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 1, // We'll compress later
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const processed = await processImage(result.assets[0].uri, options);
      setImage(processed);
      return processed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick image');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromGallery = async (options: ImagePickerOptions = {}) => {
    return pickImage(options);
  };

  const takePhoto = async (options: ImagePickerOptions = {}): Promise<PickedImage | null> => {
    setIsLoading(true);
    setError(null);

    const aspect = options.aspect || defaultOptions.aspect || [1, 1];

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera denied');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const processed = await processImage(result.assets[0].uri, options);
      setImage(processed);
      return processed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to take photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setError(null);
  };

  return {
    image,
    isLoading,
    error,
    pickImage,
    pickFromGallery,
    takePhoto,
    clearImage,
  };
}
