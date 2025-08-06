import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProgress } from '../../context/ProgressContext';

const silhouetteImage = require('../../assets/images/flowers/silhouette.png');

const flowerList = [
  {
    id: 'daisy',
    name: 'Daisy',
    desc: 'Purity and bright energy',
    image: require('../../assets/images/flowers/daisy/daisystep3.png'),
  },
  {
    id: 'hydrangea',
    name: 'Hydrangea',
    desc: 'Sincerity and gratitude',
    image: require('../../assets/images/flowers/hydrangea/hydrangeastep3.png'),
  },
  {
    id: 'lavender',
    name: 'Lavender',
    desc: 'Serenity and healing',
    image: require('../../assets/images/flowers/lavender/lavenderstep3.png'),
  },
  {
    id: 'lily',
    name: 'Lily',
    desc: 'Purity and nobility',
    image: require('../../assets/images/flowers/lily/lilystep3.png'),
  },
  {
    id: 'rose',
    name: 'Rose',
    desc: 'Love and passion',
    image: require('../../assets/images/flowers/rose/rosestep3.png'),
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    desc: 'Hope and loyalty',
    image: require('../../assets/images/flowers/sunflower/sunflowerstep3.png'),
  },
  {
    id: 'freesia',
    name: 'freesia',
    desc: "I'm rooting for your start",
    image: require('../../assets/images/flowers/freesia/freesiastep3.png'),
  },
  {
    id: 'tulip',
    name: 'Tulip',
    desc: 'Declaration of love',
    image: require('../../assets/images/flowers/tulip/tulipstep3.png'),
  },
];

export default function Collection() {
  const router = useRouter();
  const { obtainedFlowers } = useProgress();

  const [selectedFlower, setSelectedFlower] = useState<{
    flower: typeof flowerList[0];
    isCollected: boolean;
  } | null>(null);

  const handlePress = (flower) => {
    const isCollected = obtainedFlowers.includes(flower.id);
    setSelectedFlower({ flower, isCollected });
  };

  // Row alignment adjustment
  const remainder = flowerList.length % 3;
  const dummyCount = remainder === 0 ? 0 : 3 - remainder;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/Menu/Menupage')}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flower Collection</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Flower Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {flowerList.map((flower, index) => {
          const isCollected = obtainedFlowers.includes(flower.id);
          return (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => handlePress(flower)}
            >
              <Image
                source={isCollected ? flower.image : silhouetteImage}
                style={[styles.image, !isCollected && styles.silhouette]}
                resizeMode="contain"
              />
              <Text style={styles.label}>{isCollected ? flower.name : '???'}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Transparent items for alignment */}
        {Array.from({ length: dummyCount }).map((_, idx) => (
          <View key={`dummy-${idx}`} style={styles.item} />
        ))}
      </ScrollView>

      {/* Flower Detail Popup */}
      <Modal
        visible={!!selectedFlower}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFlower(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image
              source={
                selectedFlower?.isCollected
                  ? selectedFlower.flower.image
                  : silhouetteImage
              }
              style={{ width: 100, height: 100, marginBottom: 10 }}
              resizeMode="contain"
            />
            {selectedFlower?.isCollected && (
              <Text style={styles.modalTitle}>{selectedFlower.flower.name}</Text>
            )}
            <Text style={styles.modalDesc}>{selectedFlower?.flower.desc}</Text>
            <TouchableOpacity
              onPress={() => setSelectedFlower(null)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/Menu/BackgroundCollection')}>
          <Text style={styles.tab}>Background</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>Flower</Text>
        <TouchableOpacity onPress={() => router.push('/Menu/FurnitureCollection')}>
          <Text style={styles.tab}>Furniture</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/BadgeCollection')}>
          <Text style={styles.tab}>Decoration</Text>
        </TouchableOpacity>
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
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
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
    width: '100%',
    height: '100%',
    maxWidth: 80,
    maxHeight: 80,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  silhouette: {
    opacity: 0.3,
  },
  label: { fontSize: 16, fontWeight: 'bold' },

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
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalClose: {
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalCloseText: { color: '#fff', fontWeight: 'bold' },
});
