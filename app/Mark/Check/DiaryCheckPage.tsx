import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { useRouter } from 'expo-router';

export default function DiaryCheckPage() {
  const router = useRouter();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});

  const handleDayPress = (day: DateObject) => {
    const date = day.dateString;
    const isAlreadyMarked = markedDates[date]?.selected;
    const newMarkedDates = { ...markedDates };

    if (isAlreadyMarked) {
      delete newMarkedDates[date];
    } else {
      newMarkedDates[date] = {
        selected: true,
        marked: true,
        selectedColor: '#5C7BEE',
        dotColor: '#5C7BEE',
      };
    }

    setMarkedDates(newMarkedDates);
  };

  return (
    <View style={styles.container}>
      {/* ✅ 상단 제목 */}
      <Text style={styles.title}>출석체크</Text>

      <Calendar
        style={styles.calendar}
        hideExtraDays
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          textDayFontWeight: 'bold',
          todayTextColor: '#5C7BEE',
          arrowColor: '#3F5C45',
          textMonthFontSize: 16,
        }}
      />

      {/* ✅ 닫기 버튼 */}
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
    backgroundColor: '#F3F3F3',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2F4034',
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
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
