# 보고서 자동화 시스템 분석 및 프롬프트 템플릿 가이드

## 개요
본 문서는 ICCAS 2025 프로젝트의 보고서 자동화 기능에 대한 종합적인 분석과 AI 프롬프트 템플릿 설계 가이드라인을 제공합니다.

## 1. 보고서 시스템 구조

### 1.1 전체 아키텍처
```
Frontend (Report.tsx) ↔ Firebase Config ↔ Cloud Functions ↔ Gemini AI
```

- **Frontend**: React Native 기반 보고서 UI
- **Firebase Config**: 클라이언트 측 Firebase 연동 로직
- **Cloud Functions**: 서버리스 백엔드 처리
- **Gemini AI**: Google의 생성형 AI 모델

### 1.2 주요 컴포넌트
- `app/Menu/Report.tsx`: 보고서 UI 컴포넌트
- `firebase.config.ts`: 클라이언트 Firebase 연동 및 보고서 생성 함수
- `functions/src/index.ts`: 서버측 보고서 생성 로직 및 AI 통합

## 2. 데이터 흐름 분석

### 2.1 입력 데이터 구조
보고서 생성에 사용되는 입력 데이터:

#### 건강 체크 데이터 (`dailyHealthChecks`)
```typescript
{
  userId: string;
  date: string; // YYYY-MM-DD 형식
  condition: number; // 1-5 점수
  painAreas: string[]; // 통증 부위 배열
  swelling: number; // 1-5 점수
  notes?: string; // 추가 메모
  createdAt: Date;
}
```

#### 운동 기록 데이터 (`userExercises`)
```typescript
{
  userId: string;
  exerciseId: string;
  exerciseName: string;
  duration: number; // 분 단위
  difficulty: number; // 1-5 점수
  date: string; // YYYY-MM-DD 형식
  completed: boolean;
  feedback?: {
    rating: number; // 1-5 점수
    comment?: string;
  };
  rewards: {
    currency: number;
    experience: number;
  };
  createdAt: Date;
}
```

#### 사용자 프로필 데이터 (`users`)
```typescript
{
  id: string;
  gameData: {
    currency: number;
    level: number;
    totalExercises: number;
    consecutiveExercises: number;
  };
  createdAt: Date;
  lastLoginAt: Date;
}
```

### 2.2 출력 데이터 구조
생성되는 보고서 데이터 (`weeklyReports`):

```typescript
{
  userId: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: Date;
  isAIGenerated: boolean;
  
  // AI 생성 콘텐츠
  aiSummary: string;
  achievements: string[];
  recommendations: string[];
  
  // 계산된 메트릭
  healthMetrics: {
    totalCheckins: number;
    averageCondition: string;
    averageSwelling: string;
    commonPainAreas: Array<{area: string, count: number}>;
  };
  
  exerciseMetrics: {
    totalExercises: number;
    totalDuration: number; // 분 단위
    averageFeedback: string;
    completionRate: number; // 퍼센트
  };
  
  gameProgress: {
    currentLevel: number;
    totalCurrency: number;
    totalExercises: number;
    consecutiveExercises: number;
  };
}
```

## 3. AI 모델 및 프롬프트 분석

### 3.1 사용 모델
- **모델명**: `gemini-2.5-flash`
- **제공업체**: Google (GoogleGenerativeAI)
- **API**: `@google/generative-ai` 라이브러리 사용

### 3.2 현재 프롬프트 구조 (functions/src/index.ts:191-221)

#### 프롬프트 구성 요소
1. **역할 정의**: "You are an empathetic health and fitness coach"
2. **출력 언어**: Korean language
3. **데이터 요약**: JSON.stringify로 주간 데이터 요약 제공
4. **상세 데이터**: 최근 10개 건강 체크 및 운동 기록
5. **출력 형식**: JSON 구조 지정
6. **품질 지침**: "encouraging, specific to the data, and actionable"

#### 현재 프롬프트 전체
```javascript
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
```

## 4. 프롬프트 템플릿 설계 가이드라인

### 4.1 템플릿 구조 원칙

#### A. 역할 및 컨텍스트 설정
```
You are a [ROLE] analyzing [DATA_TYPE] for [PURPOSE].
Generate insights in [LANGUAGE].
```

#### B. 데이터 구조화
```
Weekly Data Summary:
- 핵심 메트릭 요약 (JSON)
- 상세 데이터 (최대 10개 항목)
- 사용자 프로필 정보
```

#### C. 출력 형식 명시
```
{
  "narrative": "[DESCRIPTION]",
  "achievements": ["ARRAY_DESCRIPTION"],
  "recommendations": ["ARRAY_DESCRIPTION"]
}
```

#### D. 품질 지침
```
Focus on being [TONE], [SPECIFICITY], and [ACTIONABILITY].
```

### 4.2 개선된 프롬프트 템플릿

#### 기본 템플릿
```javascript
const generatePromptTemplate = (userData, weeklyData, options = {}) => {
  const {
    role = "empathetic health and fitness coach",
    language = "Korean",
    tone = "encouraging",
    maxAchievements = 5,
    maxRecommendations = 5
  } = options;

  return `
You are an ${role} analyzing a user's weekly health and exercise data.
Generate personalized insights in ${language} language.

USER CONTEXT:
- User Level: ${userData.level}
- Total Exercises: ${userData.totalExercises}
- Consecutive Days: ${userData.consecutiveExercises}
- Current Streak: ${userData.currentStreak || 0} days

WEEKLY DATA SUMMARY:
${JSON.stringify({
  period: `${weeklyData.startDate} to ${weeklyData.endDate}`,
  healthMetrics: {
    checkCount: weeklyData.healthChecks.length,
    avgCondition: calculateAverage(weeklyData.healthChecks, 'condition'),
    avgSwelling: calculateAverage(weeklyData.healthChecks, 'swelling'),
    commonPainAreas: extractCommonPainAreas(weeklyData.healthChecks)
  },
  exerciseMetrics: {
    count: weeklyData.exercises.length,
    totalDuration: weeklyData.exercises.reduce((sum, ex) => sum + ex.duration, 0),
    avgRating: calculateAverage(weeklyData.exercises, 'feedback.rating'),
    completionRate: calculateCompletionRate(weeklyData.exercises)
  }
}, null, 2)}

DETAILED HEALTH RECORDS:
${JSON.stringify(weeklyData.healthChecks.slice(0, 7), null, 2)}

DETAILED EXERCISE RECORDS:
${JSON.stringify(weeklyData.exercises.slice(0, 10), null, 2)}

Generate a JSON response with:
{
  "narrative": "2-3 sentence ${tone} summary of the user's weekly health journey, acknowledging their current level (${userData.level}) and streak (${userData.consecutiveExercises} days). Be specific about improvements or areas of concern.",
  "achievements": ["Up to ${maxAchievements} specific achievements based on actual data patterns, celebrating both small wins and major milestones"],
  "recommendations": ["Up to ${maxRecommendations} actionable, personalized recommendations based on identified patterns and user's current fitness level"]
}

QUALITY GUIDELINES:
- Be ${tone} and supportive, especially for users with lower performance
- Reference specific numbers from the data (e.g., "7 workouts this week", "average condition improved to 4.2")
- Consider the user's level and experience (Level ${userData.level})
- For pain areas, provide specific care suggestions
- For exercise patterns, suggest progression based on current performance
- Use motivational Korean expressions appropriate for health/fitness context
`;
};
```

### 4.3 특수 상황별 프롬프트 변형

#### 고성과 사용자용 (Level 50+, 연속 운동 30일+)
```javascript
const highPerformerPrompt = (userData, weeklyData) => `
You are an expert fitness mentor working with a high-performing user (Level ${userData.level}).
This user has maintained ${userData.consecutiveExercises} consecutive days of exercise.

Focus on:
- Advanced optimization strategies
- Injury prevention for high-volume exercisers
- Variety and progression suggestions
- Long-term sustainability
- Performance plateau breaking techniques

[나머지 프롬프트 구조 동일]
`;
```

#### 초보자용 (Level 1-10, 운동 경험 적음)
```javascript
const beginnerPrompt = (userData, weeklyData) => `
You are a supportive beginner fitness coach working with a new user (Level ${userData.level}).
This user is building their exercise habit.

Focus on:
- Celebrating small wins and consistency
- Building confidence and motivation
- Simple, achievable next steps
- Habit formation strategies
- Gentle encouragement for missed days

[나머지 프롬프트 구조 동일]
`;
```

#### 재활 중인 사용자용 (높은 통증 점수, 부종 있음)
```javascript
const rehabilitationPrompt = (userData, weeklyData) => `
You are a rehabilitation-focused health coach working with a user managing health challenges.
Pain levels: ${calculateAverage(weeklyData.healthChecks, 'condition')}/5
Swelling levels: ${calculateAverage(weeklyData.healthChecks, 'swelling')}/5

Focus on:
- Gentle, recovery-focused encouragement
- Pain management acknowledgment
- Adaptive exercise suggestions
- Rest and recovery emphasis
- Medical professional consultation reminders

[나머지 프롬프트 구조 동일]
`;
```

### 4.4 프롬프트 최적화 전략

#### A. 동적 길이 조정
```javascript
const adjustPromptLength = (dataVolume) => {
  if (dataVolume.healthChecks > 5 && dataVolume.exercises > 5) {
    return "detailed"; // 전체 프롬프트 사용
  } else if (dataVolume.total > 3) {
    return "medium";   // 중간 길이 프롬프트
  } else {
    return "minimal";  // 최소한의 프롬프트 (데이터 부족시)
  }
};
```

#### B. 컨텍스트 우선순위
```javascript
const prioritizeContext = (weeklyData) => {
  const priorities = [];
  
  if (weeklyData.exercises.length === 0) {
    priorities.push("exercise_motivation");
  }
  
  if (averagePainLevel > 3) {
    priorities.push("pain_management");
  }
  
  if (consecutiveDays > 7) {
    priorities.push("streak_celebration");
  }
  
  return priorities;
};
```

#### C. 다국어 지원
```javascript
const multilingualPrompts = {
  ko: {
    role: "공감하는 건강 및 피트니스 코치",
    achievements: "성취사항",
    recommendations: "권장사항"
  },
  en: {
    role: "empathetic health and fitness coach", 
    achievements: "achievements",
    recommendations: "recommendations"
  }
};
```

## 5. 구현 권장사항

### 5.1 프롬프트 템플릿 관리
```typescript
// 프롬프트 템플릿을 별도 모듈로 분리
// functions/src/prompts/reportPrompts.ts

export class ReportPromptGenerator {
  static generateWeeklyReport(userData: UserData, weeklyData: WeeklyData, options?: PromptOptions): string {
    // 템플릿 생성 로직
  }
  
  static generateFallback(userData: UserData): string {
    // 데이터 부족시 폴백 프롬프트
  }
}
```

### 5.2 A/B 테스트 지원
```typescript
const promptVariants = {
  A: "기본 공감형 프롬프트",
  B: "데이터 중심 프롬프트", 
  C: "목표 지향 프롬프트"
};

// 사용자별로 다른 변형 사용
const selectedVariant = getUserPromptVariant(userId);
```

### 5.3 프롬프트 품질 모니터링
```typescript
// 생성된 응답의 품질 지표 수집
const qualityMetrics = {
  responseLength: text.length,
  containsSpecificData: checkForNumbers(text),
  languageConsistency: checkLanguage(text),
  structureCompliance: validateJSON(text)
};
```

## 6. 주요 함수 위치 참조

### Frontend (Report.tsx)
- `loadWeeklyReport()` - app/Menu/Report.tsx:20
- `generateNewReport()` - app/Menu/Report.tsx:40

### Client Firebase Config
- `generateEnhancedWeeklyReportClient()` - firebase.config.ts:307
- `getWeeklyReport()` - firebase.config.ts:415

### Backend Cloud Functions  
- `generateEnhancedWeeklyReport` - functions/src/index.ts:27
- `processUserWeeklyReport()` - functions/src/index.ts:85
- `generateAIContent()` - functions/src/index.ts:178
- `triggerReportGeneration` - functions/src/index.ts:366

## 7. 향후 개선 방향

1. **개인화 강화**: 사용자 선호도 학습 및 맞춤형 프롬프트
2. **다양한 보고서 형태**: 월간, 분기별 보고서 추가
3. **시각적 요소**: 차트 및 그래프 데이터 생성
4. **의료진 연동**: 전문가 리뷰를 위한 상세 데이터 보고서
5. **예측 분석**: 건강 트렌드 예측 및 조기 경고 시스템

---

*본 문서는 ICCAS 2025 보고서 자동화 시스템의 현재 구조를 분석하고, 향후 AI 프롬프트 최적화를 위한 가이드라인을 제공합니다.*