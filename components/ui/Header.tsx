import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { HeaderSheet } from './HeaderSheet';

export function Header() {
  const insets = useSafeAreaInsets();
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => setIsSheetVisible(true)}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://raw.githubusercontent.com/stackblitz/webcontainer-core/main/assets/bolt.svg' }}
          style={styles.logo}
        />
      </View>

      <HeaderSheet 
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#0d0d0c',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
  },
  logo: {
    width: 80,
    height: 24,
    tintColor: '#b0fb50',
  },
});