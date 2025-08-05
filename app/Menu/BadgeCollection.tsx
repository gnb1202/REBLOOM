import { useRouter } from 'expo-router';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const badgeList = [
  { id: 'flower-1', name: 'Grew 1 flower', image: require('../../assets/images/badge/getflowerstep1.png') },
  { id: 'flower-2', name: 'Grew 2 flowers', image: require('../../assets/images/badge/getflowerstep2.png') },
  { id: 'flower-3', name: 'Grew 3 flowers', image: require('../../assets/images/badge/getflowerstep3.png') },
  { id: 'flower-4', name: 'Grew 4 flowers', image: require('../../assets/images/badge/getflowerstep4.png') },
  { id: 'attend-3', name: '3-day attendance', image: require('../../assets/images/badge/exercisestep1.png') },
  { id: 'attend-5', name: '5-day attendance', image: require('../../assets/images/badge/exercisestep2.png') },
  { id: 'attend-7', name: '7-day attendance', image: require('../../assets/images/badge/exercisestep3.png') },
  { id: 'attend-14', name: '14-day attendance', image: require('../../assets/images/badge/exercisestep4.png') },
];

export default function BadgeCollection() {
  const router = useRouter();
  const { completedChallenges } = useProgress();

  const obtainedBadges = badgeList.filter(badge => completedChallenges.includes(badge.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Obtained Badges</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {obtainedBadges.length === 0 ? (
          <Text style={styles.emptyText}>No badges obtained yet.</Text>
        ) : (
          obtainedBadges.map((badge) => (
            <View key={badge.id} style={styles.item}>
              <Image source={badge.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.label}>{badge.name}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/Menu/BackgroundCollection')}>
          <Text style={styles.tab}>Background</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
          <Text style={styles.tab}>Flower</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/FurnitureCollection')}>
          <Text style={styles.tab}>Furniture</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>Badge</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  back: { fontSize: 22, marginRight: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingBottom: 80,
  },
  item: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E6ECFF',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tab: { color: '#444', fontSize: 14 },
  activeTab: {
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#C6D3FF',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});
