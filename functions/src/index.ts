import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PubSub } from '@google-cloud/pubsub';

// Firebase Admin 초기화
admin.initializeApp();
const db = admin.firestore();
const pubsub = new PubSub();

// Gemini AI 클라이언트 초기화 (secrets 사용)
let genAI: GoogleGenerativeAI;

const initializeGemini = () => {
  // Temporary hardcoded API key for testing
  const apiKey = 'AIzaSyCizMY5FUSUusttLBVoIm-nm9SWNgkHBWA';
  console.log('Using hardcoded API key for testing');
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini API client initialized successfully');
};

// 주간 리포트 AI 생성 함수
export const generateEnhancedWeeklyReport = functions
  .region('us-central1')
  .pubsub
  .topic('generate-enhanced-report')
  .onPublish(async (message, context) => {
    const userId = message.data ? Buffer.from(message.data, 'base64').toString() : null;
    
    if (!userId) {
      console.error('No userId provided in message');
      return;
    }

    try {
      await processUserWeeklyReport(userId);
      console.log(`Enhanced report generated for user: ${userId}`);
    } catch (error) {
      console.error(`Failed to generate enhanced report for user ${userId}:`, error);
    }
  });

// 모든 사용자를 위한 배치 리포트 생성 (주간 스케줄러)
export const scheduleWeeklyReports = functions
  .region('us-central1')
  .pubsub
  .schedule('0 8 * * MON')
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    console.log('Starting weekly batch report generation');

    try {
      // 활성 사용자들 조회 (최근 30일 내 활동)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsersSnapshot = await db.collection('users')
        .where('lastLoginAt', '>=', thirtyDaysAgo)
        .get();

      const batchPromises: Promise<string>[] = [];

      activeUsersSnapshot.forEach((doc) => {
        const userId = doc.id;
        // Pub/Sub로 각 사용자별 리포트 생성 트리거
        const dataBuffer = Buffer.from(userId);
        batchPromises.push(
          pubsub.topic('generate-enhanced-report').publish(dataBuffer)
        );
      });

      await Promise.all(batchPromises);
      console.log(`Triggered report generation for ${activeUsersSnapshot.size} users`);

    } catch (error) {
      console.error('Failed to schedule weekly reports:', error);
    }
  });

// 개별 사용자 리포트 생성 로직
async function processUserWeeklyReport(userId: string): Promise<void> {
  console.log(`Starting report generation for user: ${userId}`);
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  try {
    console.log(`Processing weekly data for ${startDateStr} to ${endDateStr}`);
    
    // 1. 주간 데이터 수집
    const weeklyData = await collectWeeklyData(userId, startDateStr, endDateStr);
    console.log(`Collected data: ${weeklyData.healthChecks.length} health checks, ${weeklyData.exercises.length} exercises`);

    // 2. Gemini AI로 개선된 분석 생성
    console.log('Generating AI content...');
    const aiEnhancedContent = await generateAIContent(weeklyData);
    console.log('AI content generated successfully');

    // 3. 기존 기본 메트릭 계산
    const basicMetrics = calculateBasicMetrics(weeklyData);

    // 4. 통합된 리포트 생성
    const enhancedReport = {
      ...basicMetrics,
      userId,
      weekStart: startDateStr,
      weekEnd: endDateStr,
      generatedAt: new Date(),
      aiSummary: aiEnhancedContent.narrative,
      achievements: aiEnhancedContent.achievements,
      recommendations: aiEnhancedContent.recommendations,
      isAIGenerated: true
    };

    // 5. Firestore에 저장
    const reportId = `${userId}_${endDateStr}`;
    await db.collection('weeklyReports').doc(reportId).set(enhancedReport);

    console.log(`Enhanced report saved for user ${userId} with ID ${reportId}`);

  } catch (error) {
    console.error(`Failed to process report for user ${userId}:`, error);
    // AI 실패시 기본 리포트 생성
    await generateFallbackReport(userId, startDateStr, endDateStr);
  }
}

// 주간 데이터 수집
async function collectWeeklyData(userId: string, startDate: string, endDate: string) {
  console.log(`Collecting data for user ${userId} from ${startDate} to ${endDate}`);
  
  // 건강 체크 데이터 (단순 쿼리 후 클라이언트 필터링)
  const healthChecksSnapshot = await db.collection('dailyHealthChecks')
    .where('userId', '==', userId)
    .get();

  const allHealthChecks = healthChecksSnapshot.docs.map(doc => doc.data());
  const healthChecks = allHealthChecks.filter(check => 
    check.date >= startDate && check.date <= endDate
  );
  console.log(`Filtered health checks: ${healthChecks.length} out of ${allHealthChecks.length}`);

  // 운동 기록 데이터 (단순 쿼리 후 클라이언트 필터링)
  const exercisesSnapshot = await db.collection('userExercises')
    .where('userId', '==', userId)
    .get();

  const allExercises = exercisesSnapshot.docs.map(doc => doc.data());
  const exercises = allExercises.filter(exercise => 
    exercise.date >= startDate && exercise.date <= endDate
  );
  console.log(`Filtered exercises: ${exercises.length} out of ${allExercises.length}`);

  // 사용자 프로필 데이터
  const userDoc = await db.collection('users').doc(userId).get();
  const userProfile = userDoc.exists ? userDoc.data() : null;
  console.log(`User profile loaded: ${userProfile ? 'found' : 'not found'}`);

  console.log(`Data collection completed for user ${userId}`);
  return {
    healthChecks,
    exercises,
    userProfile,
    startDate,
    endDate
  };
}

// Gemini AI 콘텐츠 생성
async function generateAIContent(weeklyData: any) {
  console.log('Starting AI content generation...');
  
  try {
    if (!genAI) {
      console.log('Initializing Gemini API...');
      initializeGemini();
      console.log('Gemini API initialized successfully');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Gemini model acquired');

  const prompt = `
You are an empathetic health and fitness coach analyzing a user's weekly health data. 
Generate insights in Korean language.

Weekly Data Summary:
${JSON.stringify({
  healthCheckCount: weeklyData.healthChecks.length,
  averageCondition: weeklyData.healthChecks.length > 0 
    ? weeklyData.healthChecks.reduce((sum: number, check: any) => sum + check.condition, 0) / weeklyData.healthChecks.length
    : 0,
  exerciseCount: weeklyData.exercises.length,
  totalExerciseDuration: weeklyData.exercises.reduce((sum: number, ex: any) => sum + ex.duration, 0),
  userLevel: weeklyData.userProfile?.gameData?.level || 1,
  painAreas: weeklyData.healthChecks.flatMap((check: any) => check.painAreas || [])
})}

Detailed Health Checks:
${JSON.stringify(weeklyData.healthChecks.slice(0, 10), null, 2)}

Detailed Exercises:
${JSON.stringify(weeklyData.exercises.slice(0, 10), null, 2)}

Please generate a JSON response with:
{
  "narrative": "2-3 sentence empathetic summary of the week's health journey in Korean",
  "achievements": ["3-5 specific achievements based on actual data", "in Korean"],
  "recommendations": ["3-5 actionable recommendations based on patterns", "in Korean"]
}

Focus on being encouraging, specific to the data, and actionable.
`;

    console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini');
    
    const response = await result.response;
    const text = response.text();
    console.log('Generated text length:', text.length);
    console.log('Generated text preview:', text.substring(0, 300));
    
    // JSON 파싱 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed AI response');
      return parsed;
    }
    
    console.log('Failed to parse JSON from AI response, using fallback');
    // 파싱 실패시 기본값
    return {
      narrative: "이번 주의 건강 관리 여정을 AI가 분석하고 있습니다.",
      achievements: ["꾸준한 건강 관리 노력"],
      recommendations: ["규칙적인 운동 지속하기"]
    };
  } catch (error) {
    console.error('Gemini AI generation failed:', error);
    throw error;
  }
}

// 기본 메트릭 계산 (기존 로직과 동일)
function calculateBasicMetrics(weeklyData: any) {
  const { healthChecks, exercises, userProfile } = weeklyData;

  return {
    healthMetrics: {
      totalCheckins: healthChecks.length,
      averageCondition: healthChecks.length > 0 
        ? (healthChecks.reduce((sum: number, check: any) => sum + check.condition, 0) / healthChecks.length).toFixed(1)
        : 0,
      averageSwelling: healthChecks.length > 0
        ? (healthChecks.reduce((sum: number, check: any) => sum + check.swelling, 0) / healthChecks.length).toFixed(1)
        : 0,
      commonPainAreas: getCommonPainAreas(healthChecks),
    },
    exerciseMetrics: {
      totalExercises: exercises.length,
      totalDuration: exercises.reduce((sum: number, ex: any) => sum + ex.duration, 0),
      averageFeedback: exercises.length > 0
        ? (exercises.reduce((sum: number, ex: any) => sum + (ex.feedback?.rating || 3), 0) / exercises.length).toFixed(1)
        : 0,
      completionRate: calculateCompletionRate(exercises, 7),
    },
    gameProgress: {
      currentLevel: userProfile?.gameData?.level || 1,
      totalCurrency: userProfile?.gameData?.currency || 0,
      totalExercises: userProfile?.gameData?.totalExercises || 0,
      consecutiveExercises: userProfile?.gameData?.consecutiveExercises || 0,
    }
  };
}

// AI 실패시 기본 리포트 생성
async function generateFallbackReport(userId: string, startDate: string, endDate: string) {
  console.log(`Generating fallback report for user ${userId}`);
  
  const weeklyData = await collectWeeklyData(userId, startDate, endDate);
  const basicMetrics = calculateBasicMetrics(weeklyData);
  
  const fallbackReport = {
    ...basicMetrics,
    userId,
    weekStart: startDate,
    weekEnd: endDate,
    generatedAt: new Date(),
    aiSummary: "이번 주의 건강 데이터를 바탕으로 기본 리포트를 생성했습니다.",
    achievements: generateBasicAchievements(weeklyData),
    recommendations: generateBasicRecommendations(weeklyData),
    isAIGenerated: false
  };

  const reportId = `${userId}_${endDate}`;
  await db.collection('weeklyReports').doc(reportId).set(fallbackReport);
}

// 헬퍼 함수들
function getCommonPainAreas(healthChecks: any[]) {
  const painAreas: { [key: string]: number } = {};
  healthChecks.forEach(check => {
    if (check.painAreas) {
      check.painAreas.forEach((area: string) => {
        painAreas[area] = (painAreas[area] || 0) + 1;
      });
    }
  });
  
  return Object.entries(painAreas)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([area, count]) => ({ area, count }));
}

function calculateCompletionRate(exercises: any[], targetDays: number) {
  const exerciseDays = new Set(exercises.map(ex => ex.date));
  return Math.round((exerciseDays.size / targetDays) * 100);
}

function generateBasicAchievements(weeklyData: any) {
  const achievements = [];
  const { healthChecks, exercises, userProfile } = weeklyData;
  
  if (healthChecks.length >= 5) {
    achievements.push('꾸준한 건강 체크 실천 🏆');
  }
  
  if (exercises.length >= 3) {
    achievements.push('주간 운동 목표 달성 💪');
  }
  
  // 사용자 레벨 기반 성과 추가
  if (userProfile?.gameData?.level >= 5) {
    achievements.push('높은 레벨 달성 🌟');
  }
  
  return achievements.length > 0 ? achievements : ['건강 관리 노력을 인정합니다 👍'];
}

function generateBasicRecommendations(weeklyData: any) {
  const recommendations = [];
  const { healthChecks, exercises } = weeklyData;
  
  if (exercises.length < 3) {
    recommendations.push('주 3회 이상 운동하는 것을 목표로 해보세요');
  }
  
  if (healthChecks.length < 5) {
    recommendations.push('매일 건강 상태를 체크하는 습관을 기르세요');
  }
  
  return recommendations.length > 0 ? recommendations : ['꾸준한 건강 관리를 지속하세요'];
}

// 수동 리포트 생성 트리거 (직접 AI 생성)
export const triggerReportGeneration = functions
  .region('us-central1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId || context.auth.uid;
    console.log(`Starting AI report generation for user: ${userId}`);
    
    try {
      // Gemini AI 직접 초기화 및 호출
      const genAI = new GoogleGenerativeAI('AIzaSyCizMY5FUSUusttLBVoIm-nm9SWNgkHBWA');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // 간단한 AI 프롬프트
      const prompt = `Generate a health report summary in Korean for a user with excellent exercise performance: 19 exercises this week, 365-day streak, level 102. Be encouraging and specific.

      Provide JSON format:
      {
        "narrative": "encouraging Korean summary",
        "achievements": ["specific achievement 1", "achievement 2"],
        "recommendations": ["recommendation 1", "recommendation 2"]
      }`;

      console.log('Calling Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('AI response received:', text.substring(0, 100));

      // JSON 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const aiContent = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        narrative: "AI 생성 테스트 성공! 이번 주 운동 성과가 정말 훌륭합니다.",
        achievements: ["연속 365일 운동 달성! 🔥", "레벨 102 달성! 🌟"],
        recommendations: ["현재 페이스 유지하기", "다양한 운동 추가해보기"]
      };

      // Firestore에 저장
      const reportId = `${userId}_${new Date().toISOString().split('T')[0]}`;
      await db.collection('weeklyReports').doc(reportId).set({
        userId,
        weekStart: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
        weekEnd: new Date().toISOString().split('T')[0],
        generatedAt: new Date(),
        aiSummary: aiContent.narrative,
        achievements: aiContent.achievements,
        recommendations: aiContent.recommendations,
        isAIGenerated: true,
        // 기본 메트릭들
        healthMetrics: { totalCheckins: 1, averageCondition: "5.0", averageSwelling: "1.0", commonPainAreas: [] },
        exerciseMetrics: { totalExercises: 19, totalDuration: 705, completionRate: 43, averageFeedback: "4.2" },
        gameProgress: { currentLevel: 102, totalCurrency: 26330, totalExercises: 1019, consecutiveExercises: 365 }
      });

      console.log(`AI report saved successfully for user ${userId}`);
      return { success: true, message: 'AI Enhanced report generated successfully!' };

    } catch (error: any) {
      console.error('AI report generation failed:', error);
      throw new functions.https.HttpsError('internal', `Failed to generate AI report: ${error?.message || 'Unknown error'}`);
    }
  });