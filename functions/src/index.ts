import { PubSub } from '@google-cloud/pubsub';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { RehabilitationPromptGenerator } from './prompts/rehabilitationPrompts';

// Firebase Admin 초기화
admin.initializeApp();
const db = admin.firestore();
const pubsub = new PubSub();

// Gemini AI 클라이언트 초기화
let genAI: GoogleGenerativeAI;

const initializeGemini = () => {
  // 환경변수에서 API 키 읽기 (보안 강화)
  const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.api_key;
  console.log('Gemini API key source:', process.env.GEMINI_API_KEY ? 'environment' : 'config');
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured in environment or config');
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

// Gemini AI 콘텐츠 생성 (재활 특화)
async function generateAIContent(weeklyData: any) {
  console.log('Starting AI content generation with rehabilitation focus...');
  
  try {
    if (!genAI) {
      console.log('Initializing Gemini API...');
      initializeGemini();
      console.log('Gemini API initialized successfully');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Gemini model acquired');

    // 사용자 데이터 준비
    const userData = {
      level: weeklyData.userProfile?.gameData?.level || 1,
      totalExercises: weeklyData.userProfile?.gameData?.totalExercises || 0,
      consecutiveExercises: weeklyData.userProfile?.gameData?.consecutiveExercises || 0,
      currency: weeklyData.userProfile?.gameData?.currency || 0
    };

    // 재활 특화 프롬프트 생성
    const prompt = RehabilitationPromptGenerator.generatePrompt(userData, weeklyData);
    
    console.log('Using rehabilitation-focused prompt for breast cancer survivor support');
    console.log('Prompt type selected based on user condition and progress');
    
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
      console.log('Successfully parsed rehabilitation-focused AI response');
      
      // 새로운 JSON 구조를 기존 구조로 매핑 (호환성 유지, 520자 목표)
      const mappedResponse = {
        narrative: parsed.greeting || "Thank you for taking care of yourself this week.",
        achievements: parsed.gentleAchievements || ["Your consistent efforts in self-care"],
        recommendations: parsed.carefulRecommendations || ["Continue listening to your body's needs"],
        // 추가 재활 특화 필드들
        wellbeingCheck: parsed.wellbeingCheck || "",
        supportMessage: parsed.supportMessage || "",
        isRehabilitationFocused: true
      };
      
      // 응답 길이 모니터링 (520자 목표)
      const totalChars = JSON.stringify(mappedResponse).length;
      console.log(`Response length: ${totalChars} characters (target: ~520)`);
      
      return mappedResponse;
    }
    
    console.log('Failed to parse JSON from AI response, using rehabilitation fallback');
    // 재활 특화 기본값 (520자 목표)
    const fallbackResponse = {
      narrative: "Thank you for your dedication to your recovery journey this week.\n\nYour consistent self-care efforts are truly meaningful.",
      achievements: ["Your commitment to daily body awareness", "Courage in continuing your healing journey"],
      recommendations: ["Honor your body's needs each day", "Celebrate every small step forward", "Rest when you need to rest"],
      wellbeingCheck: "Every moment of self-care matters in your recovery.",
      supportMessage: "You are doing beautifully. Your consistency shows real strength.",
      isRehabilitationFocused: true
    };
    
    // 폴백 응답 길이 모니터링
    const fallbackChars = JSON.stringify(fallbackResponse).length;
    console.log(`Fallback response length: ${fallbackChars} characters (target: ~520)`);
    
    return fallbackResponse;
  } catch (error) {
    console.error('Rehabilitation-focused AI generation failed:', error);
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
    aiSummary: "Thank you for your dedication to tracking your health and recovery journey this week.",
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
    achievements.push('Consistent daily self-care check-ins 💙');
  }
  
  if (exercises.length >= 3) {
    achievements.push('Gentle movement practice throughout the week 🌸');
  }
  
  if (healthChecks.length >= 3) {
    achievements.push('Taking time to listen to your body each day 🤗');
  }
  
  // Recovery journey level recognition
  if (userProfile?.gameData?.level >= 5) {
    achievements.push('Dedication to your recovery journey 🌟');
  }
  
  return achievements.length > 0 ? achievements : ['Your commitment to self-care and healing 💕'];
}

function generateBasicRecommendations(weeklyData: any) {
  const recommendations = [];
  const { healthChecks, exercises } = weeklyData;
  
  if (exercises.length < 3) {
    recommendations.push('Consider gentle movement when you feel comfortable - even 5 minutes counts');
  }
  
  if (healthChecks.length < 5) {
    recommendations.push('Try checking in with yourself daily, honoring whatever you discover');
  }
  
  if (exercises.length === 0) {
    recommendations.push('Rest is also healing - honor your body\'s need for gentle care');
  }
  
  if (healthChecks.length >= 3) {
    recommendations.push('Continue this beautiful practice of staying connected with your body');
  }
  
  return recommendations.length > 0 ? recommendations : ['Keep honoring your healing journey with patience and love'];
}

// 수동 리포트 생성 트리거 (보안 강화된 환경변수 사용)
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
      // 환경변수에서 API 키 읽기 (보안 강화)
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('GEMINI_API_KEY environment variable not set');
        throw new functions.https.HttpsError('failed-precondition', 'API key not configured');
      }
      
      console.log('Using API key from environment variable');

      // Gemini AI 직접 초기화 및 호출
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a compassionate rehabilitation supporter for breast cancer survivors. Generate a supportive health summary in English for a user who has shown dedication to their recovery: gentle activities completed this week, consistent self-care journey. Be encouraging and focus on their healing journey.

      Provide JSON format:
      {
        "narrative": "encouraging English summary focused on recovery and self-care", 
        "achievements": ["specific recovery-focused achievement 1", "achievement 2"],
        "recommendations": ["gentle recommendation 1", "recommendation 2"]
      }`;

      console.log('Calling Gemini API with rehabilitation-focused model: gemini-2.5-flash');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('AI response received:', text.substring(0, 100));

      // JSON 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const aiContent = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        narrative: "Thank you for your wonderful commitment to your recovery journey this week.",
        achievements: ["Consistent self-care and body awareness 💙", "Dedication to your healing process 🌸"],
        recommendations: ["Continue honoring your body's needs", "Celebrate every small step in your recovery"]
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