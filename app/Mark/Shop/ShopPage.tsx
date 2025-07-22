import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

import mysteryIcon from '../../../assets/images/Shop/Item.png';
import chairImage from '../../../assets/images/furnitures/whiteroundchair.png';
import tableImage from '../../../assets/images/furnitures/yellowstand.png';

import { useCoin } from '../../../context/CoinContext';
import { useProgress } from '../../../context/ProgressContext';

const categories = ['방', '가구'];

// 이미지 목록과 ID를 함께 정의
const furnitureItems = [
  { id: 'whiteroundchair', image: chairImage, price: 10 },
  { id: 'yellowstand', image: tableImage, price: 10 },
];

const roomImages = [
  { id: 'room1', image: mysteryIcon },
  { id: 'room2', image: mysteryIcon },
];

export default function ShopPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('방');
  const { coins, spendCoins, obtainedFurniture, addObtainedFurniture } = useProgress();


  const getItems = () => {
    return selectedCategory === '가구' ? furnitureItems : roomImages;
  };

  const handlePurchase = (itemId: string, price: number) => {
    if (obtainedFurniture.includes(itemId)) {
      Alert.alert('이미 구매한 아이템입니다.');
      return;
    }

    if (coins < price) {
      Alert.alert('코인이 부족합니다.');
      return;
    }

    spendCoins(price);
    addObtainedFurniture(itemId);
    Alert.alert('구매 완료', '아이템이 성공적으로 추가되었습니다.');
  };

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 + 코인 표시 */}
      <View style={styles.header}>
        <Text style={styles.title}>상점</Text>
        <Text style={styles.coinText}>보유 코인: {coins}개</Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.tab,
              selectedCategory === cat && styles.activeTab,
            ]}
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
            <Image
              source={item.image}
              style={styles.itemImage}
              resizeMode="contain"
            />
            {selectedCategory === '가구' ? (
              obtainedFurniture.includes(item.id) ? (
                <Text style={styles.ownedText}>보유 중</Text>
              ) : (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handlePurchase(item.id, item.price)}
                >
                  <Text style={styles.buyText}>{item.price} 코인 구매</Text>
                </TouchableOpacity>
              )
            ) : (
              <Text style={styles.ownedText}>미구현</Text>
            )}
          </View>
        )}
      />

      {/* 닫기 버튼 */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push('/Home_page/Homepage')}
      >
        <Text style={styles.closeButtonText}>닫기</Text>
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
