import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Helper function to generate a random string
function generateRandomId() {
  const timestamp = new Date().getTime();
  const randomNum = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomNum}`;
}

export async function pickImage() {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
}

export async function uploadProfileImage(uri: string, userId: string): Promise<string> {
  try {
    // Delete existing avatar files for this user
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listError) {
      console.error('Error listing existing files:', listError);
    } else if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToRemove);

      if (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
      }
    }

    // Generate a unique filename
    const filePath = `${userId}/${generateRandomId()}.jpg`;

    // Convert image to blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to fetch image data');
    }
    
    const blob = await response.blob();
    if (!blob) {
      throw new Error('Failed to create blob from image');
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    throw error;
  }
}