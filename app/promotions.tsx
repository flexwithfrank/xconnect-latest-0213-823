import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const promotions = [
  {
    id: '1',
    title: 'Two Weeks Free',
    description: 'Get your first two weeks free at any of our studio locations. New members only.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop',
    url: 'https://example.com/two-weeks-free',
    buttonText: 'Claim Offer',
  },
  {
    id: '2',
    title: '50% Off First Month',
    description: 'Join now and get 50% off your first month of unlimited classes.',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=400&fit=crop',
    url: 'https://example.com/half-off',
    buttonText: 'Get 50% Off',
  },
  {
    id: '3',
    title: '$50 Off Med Spa',
    description: 'Treat yourself to any med spa treatment and save $50 on your first visit.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=400&fit=crop',
    url: 'https://example.com/med-spa',
    buttonText: 'Book Now',
  },
];

export default function PromotionsScreen() {
  const insets = useSafeAreaInsets();

  const handleOpenPromotion = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {promotions.map((promo) => (
          <View key={promo.id} style={styles.card}>
            <Image
              source={{ uri: promo.image }}
              style={styles.cardImage}
            />
            <View style={styles.cardOverlay}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{promo.title}</Text>
                <Text style={styles.cardDescription}>{promo.description}</Text>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => handleOpenPromotion(promo.url)}
                >
                  <Text style={styles.cardButtonText}>{promo.buttonText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  scrollContent: {
    padding: 16,
  },
  card: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  cardButton: {
    backgroundColor: '#b0fb50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});