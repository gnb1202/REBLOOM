import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { generateWeeklyReport, getWeeklyReport } from '../../firebase.config';

export default function Report() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadWeeklyReport();
  }, [user]);

  const loadWeeklyReport = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 먼저 기존 리포트가 있는지 확인
      const existingReport = await getWeeklyReport(user.uid);
      if (existingReport) {
        setReportData(existingReport);
      } else {
        // 리포트가 없으면 자동 생성
        await generateNewReport();
      }
    } catch (error) {
      console.error('Failed to load report:', error);
      Alert.alert('Error', 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewReport = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const newReport = await generateWeeklyReport(user.uid);
      setReportData(newReport);
      Alert.alert('Complete', 'New weekly report has been generated! 📊');
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3F5C45" />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noDataText}>No report data available.</Text>
        <TouchableOpacity 
          style={styles.generateButton} 
          onPress={generateNewReport}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate New Report</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Health Report 📊</Text>
        <Text style={styles.dateRange}>
          {formatDate(reportData.weekStart)} - {formatDate(reportData.weekEnd)}
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={generateNewReport}
          disabled={generating}
        >
          <Text style={styles.refreshButtonText}>
            {generating ? 'Generating...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Health Check Status */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>💊 Health Check Status</Text>
        <Text style={styles.text}>Total Check-ins: {reportData.healthMetrics.totalCheckins} times</Text>
        <Text style={styles.text}>Average Condition: {reportData.healthMetrics.averageCondition}/5</Text>
        <Text style={styles.text}>Average Swelling: {reportData.healthMetrics.averageSwelling}/5</Text>
        
        {reportData.healthMetrics.commonPainAreas.length > 0 && (
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Main Pain Areas:</Text>
            {reportData.healthMetrics.commonPainAreas.map((item: any, index: number) => (
              <Text key={index} style={styles.text}>• {item.area} ({item.count} times)</Text>
            ))}
          </View>
        )}
      </View>

      {/* Exercise Performance */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>💪 Exercise Performance</Text>
        <Text style={styles.text}>Total Exercises: {reportData.exerciseMetrics.totalExercises} times</Text>
        <Text style={styles.text}>Total Exercise Time: {formatDuration(reportData.exerciseMetrics.totalDuration)}</Text>
        <Text style={styles.text}>Exercise Completion Rate: {reportData.exerciseMetrics.completionRate}%</Text>
        <Text style={styles.text}>Average Satisfaction: {reportData.exerciseMetrics.averageFeedback}/5</Text>
      </View>

      {/* Game Progress */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>🎮 Game Progress</Text>
        <Text style={styles.text}>Current Level: {reportData.gameProgress.currentLevel}</Text>
        <Text style={styles.text}>Coins Owned: {reportData.gameProgress.totalCurrency} coins</Text>
        <Text style={styles.text}>Total Exercises: {reportData.gameProgress.totalExercises} times</Text>
        <Text style={styles.text}>Consecutive Exercises: {reportData.gameProgress.consecutiveExercises} times</Text>
      </View>

      {/* Key Achievements */}
      {reportData.achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>🏆 Key Achievements</Text>
          {reportData.achievements.map((achievement: string, index: number) => (
            <Text key={index} style={styles.achievementText}>• {achievement}</Text>
          ))}
        </View>
      )}

      {/* Improvement Recommendations */}
      {reportData.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>💡 Improvement Recommendations</Text>
          {reportData.recommendations.map((recommendation: string, index: number) => (
            <Text key={index} style={styles.recommendationText}>• {recommendation}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F4034',
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#3F5C45',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#3F5C45',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4034',
    marginBottom: 12,
  },
  subSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  achievementText: {
    fontSize: 15,
    color: '#2F4034',
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  recommendationText: {
    fontSize: 15,
    color: '#FF6B35',
    marginBottom: 4,
    lineHeight: 20,
  },
});
