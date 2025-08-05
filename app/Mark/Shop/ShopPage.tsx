import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { getShopItems, getUserInventory, saveUserInventory } from '../../../firebase.config';

import mysteryIcon from '../../../assets/images/Shop/Item.png';
import chairImage from '../../../assets/images/furnitures/whiteroundchair.png';
import tableImage from '../../../assets/images/furnitures/yellowstand.png';

import { useProgress } from '../../../context/ProgressContext';

const categories = ['Room', 'Furniture', 'Flower', 'Decoration'];

// Default shop items (fallback if Firebase loading fails)
const defaultShopItems = {
  'Furniture': [
    { id: 'whiteroundchair', name: 'White Chair', image: chairImage, price: 150, category: 'Furniture' },
    { id: 'yellowstand', name: 'Yellow Stand', image: tableImage, price: 200, category: 'Furniture' },
    { id: 'furniture_desk', name: 'Desk', image: mysteryIcon, price: 300, category: 'Furniture' },
    { id: 'furniture_lamp', name: 'Lamp', image: mysteryIcon, price: 120, category: 'Furniture' },
  ],
  'Room': [
    { id: 'room_cozy', name: 'Cozy Room', image: mysteryIcon, price: 500, category: 'Room' },
    { id: 'room_modern', name: 'Modern Room', image: mysteryIcon, price: 800, category: 'Room' },
    { id: 'room_garden', name: 'Garden Room', image: mysteryIcon, price: 1000, category: 'Room' },
  ],
  'Flower': [
    { id: 'flower_rose', name: 'Rose', image: mysteryIcon, price: 50, category: 'Flower' },
    { id: 'flower_tulip', name: 'Tulip', image: mysteryIcon, price: 60, category: 'Flower' },
    { id: 'flower_sunflower', name: 'Sunflower', image: mysteryIcon, price: 80, category: 'Flower' },
    { id: 'flower_lily', name: 'Lily', image: mysteryIcon, price: 70, category: 'Flower' },
  ],
  'Decoration': [
    { id: 'deco_frame', name: 'Frame', image: mysteryIcon, price: 100, category: 'Decoration' },
    { id: 'deco_vase', name: 'Vase', image: mysteryIcon, price: 90, category: 'Decoration' },
    { id: 'deco_clock', name: 'Clock', image: mysteryIcon, price: 180, category: 'Decoration' },
  ]
};

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Room');
  const [shopItems, setShopItems] = useState(defaultShopItems);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    coins,
    spendCoins,
    obtainedFurniture,
    addObtainedFurniture,
    obtainedRooms,
    addObtainedRoom,
    obtainedFlowers,
    addObtainedFlower,
  } = useProgress();

  // Firebase에서 상점 데이터 로드
  useEffect(() => {
    const loadShopData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 상점 아이템 로드 (Firebase 시도, 실패 시 기본값 사용)
        const firebaseItems = await getShopItems();
        if (firebaseItems.length > 0) {
          // Firebase 데이터를 카테고리별로 그룹화
          const groupedItems = firebaseItems.reduce((acc: any, item: any) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setShopItems(groupedItems);
        }

        // 사용자 구매 내역 로드
        const inventory = await getUserInventory(user.uid);
        if (inventory) {
          setPurchasedItems(inventory.purchasedItems || []);
        }
      } catch (error) {
        console.error('Failed to load shop data:', error);
        // 기본값 사용
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [user]);

  const getItems = () => shopItems[selectedCategory] || [];

  const isOwned = (itemId: string) => {
    if (purchasedItems.includes(itemId)) return true;
    
    switch (selectedCategory) {
      case 'Furniture':
        return obtainedFurniture.includes(itemId);
      case 'Room':
        return obtainedRooms.includes(itemId);
      case 'Flower':
        return obtainedFlowers.includes(itemId);
      case 'Decoration':
        return purchasedItems.includes(itemId);
      default:
        return false;
    }
  };

  const handlePurchase = async (itemId: string, price: number) => {
    if (isOwned(itemId)) {
      Alert.alert('Item already owned.');
      return;
    }

    if (coins < price) {
      Alert.alert('Not enough coins.');
      return;
    }

    try {
      // 코인 소모
      const success = await spendCoins(price);
      if (!success) {
        Alert.alert('Purchase Failed', 'Not enough coins.');
        return;
      }

      // 카테고리별 아이템 추가
      switch (selectedCategory) {
        case 'Furniture':
          addObtainedFurniture(itemId);
          break;
        case 'Room':
          addObtainedRoom(itemId);
          break;
        case 'Flower':
          addObtainedFlower(itemId);
          break;
        case 'Decoration':
          // Decoration items are managed separately
          const newPurchased = [...purchasedItems, itemId];
          setPurchasedItems(newPurchased);
          break;
      }

      // Firebase에 구매 내역 저장
      if (user) {
        const newPurchased = [...purchasedItems, itemId];
        await saveUserInventory(user.uid, {
          purchasedItems: newPurchased,
          totalPurchases: newPurchased.length,
          lastPurchaseDate: new Date().toISOString().split('T')[0]
        });
      }

      Alert.alert('Purchase Complete! 🎉', 'Item successfully added.');
    } catch (error) {
      console.error('Purchase processing failed:', error);
      Alert.alert('Purchase Failed', 'An error occurred during purchase processing.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3F5C45" />
        <Text style={styles.loadingText}>Loading shop data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 + 코인 표시 */}
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.coinText}>💰 {coins}</Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, selectedCategory === cat && styles.activeTab]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && styles.activeTabText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 아이템 리스트 */}
      <FlatList
        key={selectedCategory}
        data={getItems()}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
            <Text style={styles.itemName}>{item.name || item.id}</Text>
            {isOwned(item.id) ? (
              <Text style={styles.ownedText}>✅ Owned</Text>
            ) : (
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handlePurchase(item.id, item.price)}
              >
                <Text style={styles.buyText}>💰 {item.price} Buy</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in this category.</Text>
          </View>
        }
      />

      {/* 닫기 버튼 */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push('/Home_page/Homepage')}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#3F5C45',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F4034',
  },
  coinText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3F5C45',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#3F5C45',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8F5EF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  activeTab: {
    backgroundColor: '#3F5C45',
    borderBottomWidth: 2,
    borderBottomColor: '#3F5C45',
  },
  tabText: {
    color: '#3F5C45',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  grid: {
    paddingBottom: 80,
  },
  itemBox: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2F4034',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#3F5C45',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ownedText: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#3F5C45',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
