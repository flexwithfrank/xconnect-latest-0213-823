import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { EditProfileModal } from '../../components/ui/EditProfileModal';

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  favorite_workout: string | null;
  created_at: string;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, bio, favorite_workout, created_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Could not load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            profile.avatar_url
              ? { uri: profile.avatar_url }
              : { uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' }
          }
          style={styles.avatar}
        />
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {profile.favorite_workout && (
          <View style={styles.workoutContainer}>
            <Ionicons name="barbell-outline" size={16} color="#666666" />
            <Text style={styles.workoutText}>{profile.favorite_workout}</Text>
          </View>
        )}

        <View style={styles.joinedContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666666" />
          <Text style={styles.joinedText}>
            Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.emptyText}>No posts yet</Text>
      </View>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        profile={profile}
        onProfileUpdate={loadProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b0fb50',
    marginBottom: 16,
  },
  editButtonText: {
    color: '#b0fb50',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 6,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 6,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});