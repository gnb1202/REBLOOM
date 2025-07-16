import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

import mysteryIcon from '../../../assets/images/Shop/Item.png';

const dummyItems = Array.from({ length: 9 }).map((_, i) => ({
  id: i.toString(),
}));

const categories = ['방', '꽃', '가구'];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('방');

  return (
    <View style={styles.container}>
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
        data={dummyItems}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Image source={mysteryIcon} style={styles.itemImage} resizeMode="contain" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6',
    paddingHorizontal: 20,
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
    gap: 12,
  },
  itemBox: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.66%',
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '80%',
    height: '80%',
  },
});
