import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Platform, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = new Animated.Value(Platform.OS === 'web' ? 0 : 1000);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    async function checkProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/auth/sign-in');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Profile not found');
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        router.replace('/auth/sign-in');
      }
    }

    checkProfile();
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/auth/sign-in');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found. Please sign in again.');
      }

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
        });

      if (postError) throw postError;

      // Close the modal immediately after successful post
      handleClose();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPostDisabled = !content.trim() || loading;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <Animated.View 
        style={[
          styles.container,
          { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handlePost}
            disabled={isPostDisabled}
            style={[
              styles.postButton,
              isPostDisabled && styles.postButtonDisabled
            ]}
          >
            <Text style={[
              styles.postButtonText,
              isPostDisabled && styles.postButtonTextDisabled
            ]}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account-circle" size={40} color="#666666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="What's happening?"
              placeholderTextColor="#666666"
              multiline
              autoFocus
              value={content}
              onChangeText={setContent}
              maxLength={280}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons name="image-outline" size={24} color="#1d9bf0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons name="video-outline" size={24} color="#1d9bf0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#1d9bf0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons name="map-marker-outline" size={24} color="#1d9bf0" />
            </TouchableOpacity>
          </View>
          <View style={styles.toolbarRight}>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons name="earth" size={20} color="#1d9bf0" />
              <Text style={styles.replyText}>Everyone can reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2f3336',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#1d9bf0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  postButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2f3336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    paddingTop: 8,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ff000020',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#2f3336',
    marginHorizontal: 16,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    padding: 4,
  },
  replyText: {
    color: '#1d9bf0',
    fontSize: 14,
    marginLeft: 4,
  },
});