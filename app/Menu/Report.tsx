import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { generateEnhancedWeeklyReportClient, getWeeklyReport } from '../../firebase.config';

const { width } = Dimensions.get('window');

export default function Report() {
  const router = useRouter();
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
      const existingReport = await getWeeklyReport(user.uid);
      if (existingReport) {
        setReportData(existingReport);
      } else {
        // Use mock data for demo if no existing report
        const mockData = getMockReportData();
        setReportData(mockData);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
      Alert.alert('Error', 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo purposes
  const getMockReportData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    return {
      weekStart: weekStart.toISOString(),
      weekEnd: today.toISOString(),
      isAIGenerated: true,
      
      // AI Summary
      aiSummary: "Great progress this week! You've maintained consistent exercise routine with 5 sessions completed. Your shoulder mobility has improved by 15%, and pain levels have decreased. Keep up the excellent work on your recovery journey.",
      
      wellbeingCheck: "Your mental resilience is remarkable. Remember to celebrate small victories - every exercise completed brings you closer to full recovery.",
      
      // Weekly Highlights
      achievements: [
        "Completed 5 exercise sessions this week (+2 from last week)",
        "Achieved 3 consecutive days of rehabilitation exercises",
        "Shoulder flexibility improved - reached 120° range of motion",
        "Pain level reduced from 4/10 to 2/10 during exercises",
        "Earned 'Consistent Warrior' badge for daily check-ins"
      ],
      
      // Health Metrics
      healthMetrics: {
        totalCheckins: 6,
        averageCondition: "3.8",
        averageSwelling: "1.2",
        commonPainAreas: [
          { area: "Shoulder", count: 4 },
          { area: "Upper Arm", count: 2 },
          { area: "Neck", count: 1 }
        ]
      },
      
      // Exercise Metrics
      exerciseMetrics: {
        completionRate: 85,
        totalExercises: 35,
        totalDuration: 180,
        averageFeedback: "4.2"
      },
      
      // AI Recommendations
      recommendations: [
        "Try adding 'Lateral Raise' exercise next week as your strength improves",
        "Consider gentle stretching before bed to reduce morning stiffness",
        "Your progress suggests you're ready for Medium difficulty exercises",
        "Ice therapy after exercises can help reduce any residual swelling"
      ],
      
      // Support Message
      supportMessage: "You're doing amazingly well! Recovery is a journey, not a race. Every small step forward is a victory worth celebrating. We're here with you every step of the way. 💙"
    };
  };

  const generateNewReport = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Try to get report from server first
      const newReport = await generateEnhancedWeeklyReportClient(user.uid);
      setReportData(newReport);
      const alertMessage = newReport?.isAIGenerated 
        ? 'AI-powered weekly report has been generated! 🤖📊'
        : 'New weekly report has been generated! 📊';
      Alert.alert('Complete', alertMessage);
    } catch (error) {
      console.error('Failed to generate report:', error);
      // Use mock data as fallback
      const mockData = getMockReportData();
      setReportData(mockData);
      Alert.alert('Demo Mode', 'Using sample report data for demonstration.');
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
    <View style={styles.container}>
      {/* 상단바 */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/Menu/Menupage')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Report</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateNewReport}
          disabled={generating}
        >
          <Text style={styles.refreshButtonText}>
            {generating ? '...' : '↻'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 날짜 범위 카드 */}
        <View style={styles.dateCard}>
          <Text style={styles.dateTitle}>📅 Report Period</Text>
          <Text style={styles.dateRange}>
            {formatDate(reportData.weekStart)} - {formatDate(reportData.weekEnd)}
          </Text>
        </View>

        {/* AI 재활 지원 메시지 */}
        {reportData.aiSummary && (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>💙 Your Recovery Journey This Week</Text>
            </View>
            <View style={styles.aiContent}>
              <Text style={styles.aiText}>{reportData.aiSummary}</Text>
              {reportData.wellbeingCheck && (
                <View style={styles.wellbeingSection}>
                  <Text style={styles.wellbeingText}>{reportData.wellbeingCheck}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 성취 사항 (AI 기반) */}
        {reportData.achievements && reportData.achievements.length > 0 && (
          <View style={styles.achievementCard}>
            <Text style={styles.cardTitle}>🌸 Your Weekly Highlights</Text>
            <View style={styles.achievementList}>
              {reportData.achievements.map((achievement: string, index: number) => (
                <View key={index} style={styles.achievementItem}>
                  <Text style={styles.achievementDot}>•</Text>
                  <Text style={styles.achievementText}>{achievement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 건강 상태 시각화 */}
        <View style={styles.healthCard}>
          <Text style={styles.cardTitle}>💊 Health Status</Text>
          
          {/* 체크인 횟수 */}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Check-ins this week</Text>
            <View style={styles.checkinVisual}>
              {[...Array(7)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.checkinDot, 
                    i < reportData.healthMetrics.totalCheckins ? styles.checkinDotFilled : styles.checkinDotEmpty
                  ]} 
                />
              ))}
              <Text style={styles.checkinCount}>{reportData.healthMetrics.totalCheckins}/7</Text>
            </View>
          </View>

          {/* 컨디션 바 */}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Condition</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${(parseFloat(reportData.healthMetrics.averageCondition) / 5) * 100}%` }
                ]} />
              </View>
              <Text style={styles.progressText}>{reportData.healthMetrics.averageCondition}/5</Text>
            </View>
          </View>

          {/* 부종 바 */}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Swelling</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFillSwelling, 
                  { width: `${(parseFloat(reportData.healthMetrics.averageSwelling) / 5) * 100}%` }
                ]} />
              </View>
              <Text style={styles.progressText}>{reportData.healthMetrics.averageSwelling}/5</Text>
            </View>
          </View>

          {/* 통증 부위 */}
          {reportData.healthMetrics.commonPainAreas.length > 0 && (
            <View style={styles.painAreaSection}>
              <Text style={styles.painAreaTitle}>Main Pain Areas</Text>
              <View style={styles.painAreaList}>
                {reportData.healthMetrics.commonPainAreas.map((item: any, index: number) => (
                  <View key={index} style={styles.painAreaItem}>
                    <Text style={styles.painAreaText}>{item.area}</Text>
                    <Text style={styles.painAreaCount}>{item.count}x</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 운동 성과 시각화 */}
        <View style={styles.exerciseCard}>
          <Text style={styles.cardTitle}>💪 Exercise Performance</Text>
          
          {/* 운동 횟수 원형 진행률 */}
          <View style={styles.exerciseStatsRow}>
            <View style={styles.exerciseStatItem}>
              <View style={styles.circularProgress}>
                <View style={[
                  styles.circularProgressBar,
                  { transform: [{ rotate: `${(reportData.exerciseMetrics.completionRate / 100) * 180}deg` }] }
                ]} />
                <Text style={styles.circularProgressText}>{reportData.exerciseMetrics.completionRate}%</Text>
              </View>
              <Text style={styles.exerciseStatLabel}>Completion Rate</Text>
            </View>
            
            <View style={styles.exerciseStatItem}>
              <Text style={styles.exerciseStatNumber}>{reportData.exerciseMetrics.totalExercises}</Text>
              <Text style={styles.exerciseStatLabel}>Total Exercises</Text>
            </View>
          </View>

          {/* 운동 시간 */}
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Total Exercise Time</Text>
            <Text style={styles.timeValue}>{formatDuration(reportData.exerciseMetrics.totalDuration)}</Text>
          </View>

          {/* 만족도 별점 */}
          <View style={styles.satisfactionSection}>
            <Text style={styles.satisfactionLabel}>Average Satisfaction</Text>
            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text 
                  key={star} 
                  style={[
                    styles.star, 
                    star <= parseFloat(reportData.exerciseMetrics.averageFeedback) ? styles.starFilled : styles.starEmpty
                  ]}
                >
                  ⭐
                </Text>
              ))}
              <Text style={styles.satisfactionValue}>{reportData.exerciseMetrics.averageFeedback}/5</Text>
            </View>
          </View>
        </View>


        {/* gentle care suggestions */}
        {reportData.recommendations && reportData.recommendations.length > 0 && (
          <View style={styles.recommendationCard}>
            <Text style={styles.cardTitle}>🌿 Gentle Care Suggestions</Text>
            <View style={styles.recommendationList}>
              {reportData.recommendations.map((recommendation: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>🌿</Text>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Support Message */}
        {reportData.supportMessage && (
          <View style={styles.supportCard}>
            <View style={styles.supportHeader}>
              <Text style={styles.supportTitle}>💕 With You on This Journey</Text>
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportText}>{reportData.supportMessage}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 80,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // 상단바 스타일
  headerBar: {
    width: '100%',
    height: 42,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    padding: 6,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 25,
    color: '#4a90e2',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.5,
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    padding: 6,
    zIndex: 10,
  },
  refreshButtonText: {
    fontSize: 20,
    color: '#4a90e2',
    fontWeight: '500',
  },

  // 스크롤 컨테이너
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // 날짜 카드
  dateCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },

  // AI 카드
  aiCard: {
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  aiContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  aiText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '500',
  },

  // 성취사항 카드
  achievementCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  achievementDot: {
    fontSize: 16,
    color: '#F59E0B',
    marginRight: 8,
    marginTop: 2,
  },
  achievementText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },

  // 건강 카드
  healthCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#22C55E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricRow: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  
  // 체크인 시각화
  checkinVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  checkinDotFilled: {
    backgroundColor: '#22C55E',
  },
  checkinDotEmpty: {
    backgroundColor: '#E5E7EB',
  },
  checkinCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
    marginLeft: 12,
  },

  // 프로그레스 바
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 6,
  },
  progressFillSwelling: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 35,
  },

  // 통증 부위
  painAreaSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  painAreaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  painAreaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  painAreaItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  painAreaText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  painAreaCount: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // 운동 카드
  exerciseCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  exerciseStatItem: {
    alignItems: 'center',
  },
  circularProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  circularProgressBar: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#F59E0B',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circularProgressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  exerciseStatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  exerciseStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },

  // 시간 섹션
  timeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },

  // 만족도 섹션
  satisfactionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  satisfactionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 20,
  },
  starFilled: {
    opacity: 1,
  },
  starEmpty: {
    opacity: 0.3,
  },
  satisfactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },

  // 추천사항 카드
  recommendationCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  recommendationBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },

  // 로딩 및 에러 상태
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
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // 재활 특화 스타일들
  wellbeingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F2FF',
  },
  wellbeingText: {
    fontSize: 15,
    color: '#5A67D8',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Support Message Card
  supportCard: {
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#E91E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportHeader: {
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  supportContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  supportText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});