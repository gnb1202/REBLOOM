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

import mailbox_A_black from '../../assets/images/furnitures/mailbox/mailbox_A_black.png';
import mailbox_A_blackwhite from '../../assets/images/furnitures/mailbox/mailbox_A_blackwhite.png';
import mailbox_A_white from '../../assets/images/furnitures/mailbox/mailbox_A_white.png';
import signboard from '../../assets/images/furnitures/signboard/Standingboard.png';

const furnitureList = [
  {
    id: 'mailbox_A_black',
    name: 'Black Mailbox',
    desc: 'A classic black mailbox for your room.',
    image: mailbox_A_black,
  },
  {
    id: 'mailbox_A_blackwhite',
    name: 'Black & White Mailbox',
    desc: 'A stylish black and white mailbox.',
    image: mailbox_A_blackwhite,
  },
  {
    id: 'mailbox_A_white',
    name: 'White Mailbox',
    desc: 'A modern white mailbox for clean interiors.',
    image: mailbox_A_white,
  },
  {
    id: 'signboard',
    name: 'Standing Signboard',
    desc: 'A decorative standing signboard for your space.',
    image: signboard,
  },
];


export default function FurnitureCollection() {
  const router = useRouter();
  const { obtainedFurniture } = useProgress();
  const [selectedFurniture, setSelectedFurniture] = useState(null);

  const ownedItems = furnitureList.filter((item) =>
    obtainedFurniture.includes(item.id)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/Menu/Menupage')}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Furniture Collection</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Display only obtained furniture */}
      <ScrollView contentContainerStyle={styles.grid}>
        {ownedItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() => setSelectedFurniture(item)}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedFurniture}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFurniture(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image
              source={selectedFurniture?.image}
              style={{ width: 100, height: 100, marginBottom: 10 }}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>{selectedFurniture?.name}</Text>
            <Text style={styles.modalDesc}>{selectedFurniture?.desc}</Text>
            <TouchableOpacity
              onPress={() => setSelectedFurniture(null)}
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
        <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
          <Text style={styles.tab}>Flower</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>Furniture</Text>
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
