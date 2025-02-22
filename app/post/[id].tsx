import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
};

export default function PostScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
    fetchComments();

    // Subscribe to new comments
    const channel = supabase.channel('public:comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newComment } = await supabase
              .from('comments')
              .select(`
                id,
                content,
                created_at,
                user_id,
                profiles (
                  username,
                  display_name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (newComment) {
              setComments(prev => [newComment, ...prev]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: id,
          user_id: user.id,
        });

      if (error) throw error;
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b0fb50" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Post not found'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchPost();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.post}>
          <View style={styles.postHeader}>
            <Image
              source={
                post.profiles.avatar_url
                  ? { uri: post.profiles.avatar_url }
                  : { uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }
              }
              style={styles.avatar}
            />
            <View style={styles.postHeaderText}>
              <Text style={styles.displayName}>{post.profiles.display_name}</Text>
              <Text style={styles.username}>@{post.profiles.username}</Text>
            </View>
          </View>
          
          <Text style={styles.postContent}>{post.content}</Text>
          
          <View style={styles.postMeta}>
            <Text style={styles.timestamp}>
              {new Date(post.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
              {' · '}
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {comments.length}
              </Text>
              <Text style={styles.statLabel}>
                {comments.length === 1 ? 'Reply' : 'Replies'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Reposts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {comments.map((comment) => (
          <View key={comment.id} style={styles.comment}>
            <Image
              source={
                comment.profiles.avatar_url
                  ? { uri: comment.profiles.avatar_url }
                  : { uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }
              }
              style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentDisplayName}>
                  {comment.profiles.display_name}
                </Text>
                <Text style={styles.commentUsername}>
                  @{comment.profiles.username}
                </Text>
                <Text style={styles.commentTimestamp}>
                  · {new Date(comment.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
              <View style={styles.commentActions}>
                <TouchableOpacity style={styles.commentAction}>
                  <MaterialCommunityIcons name="heart-outline" size={16} color="#666666" />
                  <Text style={styles.commentActionText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentAction}>
                  <MaterialCommunityIcons name="repeat" size={18} color="#666666" />
                  <Text style={styles.commentActionText}>0</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }}
          style={styles.commentAvatar}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Post your reply"
            placeholderTextColor="#666666"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!newComment.trim() || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
          >
            <Text style={[
              styles.submitButtonText,
              (!newComment.trim() || submitting) && styles.submitButtonTextDisabled
            ]}>
              {submitting ? 'Posting...' : 'Reply'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  post: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  username: {
    fontSize: 14,
    color: '#666666',
  },
  postContent: {
    fontSize: 22,
    lineHeight: 28,
    color: '#ffffff',
    marginBottom: 12,
  },
  postMeta: {
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 16,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
  },
  divider: {
    height: 8,
    backgroundColor: '#1a1a1a',
  },
  comment: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentDisplayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 4,
  },
  commentUsername: {
    fontSize: 14,
    color: '#666666',
  },
  commentTimestamp: {
    fontSize: 14,
    color: '#666666',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#000000',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#b0fb50',
    borderRadius: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    opacity: 0.5,
  },
});