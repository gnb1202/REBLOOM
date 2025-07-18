import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';

export default function DiaryCheckPage() {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    padding: 20,
    justifyContent: 'center',
  },
  calendar: {
    borderRadius: 12,
  },
});