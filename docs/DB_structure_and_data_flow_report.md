# 프로젝트 DB 구조 및 데이터 흐름 분석 보고서

## 1. 개요

이 문서는 ICCAS 2025 프로젝트의 데이터베이스 구조와 주요 데이터 흐름을 분석하여 기술합니다.

### 1.1. 기술 스택
- **프론트엔드**: React Native (Expo)
- **백엔드**:
    1.  **주요 비즈니스 로직**: Firebase (Authentication, Firestore, Functions)
    2.  **AI 운동 분석**: Python FastAPI 서버
- **데이터베이스**: Google Firestore (NoSQL)

### 1.2. 전체 데이터 흐름 요약
사용자는 React Native 앱을 통해 서비스와 상호작용합니다. 사용자 인증, 프로필 정보, 게임 데이터 등 핵심 데이터는 모두 **Firestore**에 저장되며, 관련 로직은 **Firebase Auth** 및 프론트엔드 코드 내 Firebase SDK 호출을 통해 처리됩니다.

실시간 운동 자세 분석이 필요한 경우, 앱은 별도의 **Python FastAPI 백엔드**와 통신합니다. 이 AI 서버는 카메라 스트림을 받아 자세를 분석하고 운동 횟수, 정확도 등의 데이터를 실시간으로 앱에 전송하지만, 이 데이터를 영구적으로 저장하지는 않습니다. 운동이 종료되면, 최종 결과 데이터(총 운동 시간, 횟수 등)는 앱을 통해 다시 Firestore에 저장됩니다.

주간 활동 요약 및 AI 분석 리포트는 **Firebase Functions**를 통해 주기적으로(매주 월요일) 또는 수동으로 생성되어 Firestore에 저장됩니다.

---

## 2. 데이터베이스 구조 (Firestore Collections)

코드 분석을 통해 유추한 Firestore의 주요 컬렉션 구조는 다음과 같습니다.

### 2.1. `users`
사용자의 기본 정보와 게임 진행 상태를 저장하는 핵심 컬렉션입니다. 문서 ID는 Firebase Auth의 `uid`와 동일합니다.

-   `id` (string): 사용자 고유 ID (이메일 형식)
-   `nickname` (string): 사용자 닉네임
-   `surgeryDate` (string): 수술일 (e.g., "2024-08-10")
-   `createdAt` (Timestamp): 계정 생성 시각
-   `lastLoginAt` (Timestamp): 마지막 로그인 시각
-   `profile` (map): 공개 프로필 정보
    -   `nickname` (string): 프로필 닉네임
    -   `avatar` (string, optional): 아바타 이미지 URL
    -   `selectedBadge` (string, optional): 대표 배지 ID
-   `gameData` (map): 게임 관련 데이터
    -   `currency` (number): 보유 재화 (코인)
    -   `level` (number): 사용자 레벨
    -   `totalExercises` (number): 누적 운동 횟수
    -   `consecutiveExercises` (number): 연속 운동 일수

### 2.2. `userExercises`
사용자의 운동 완료 기록을 저장합니다.

-   `userId` (string): 사용자 `uid`
-   `date` (string): 운동 완료 날짜 (e.g., "2024-08-10")
-   `duration` (number): 총 운동 시간 (초)
-   `exerciseType` (string): 운동 종류 ID (e.g., "arm_raise")
-   `count` (number): 운동 횟수
-   `accuracy` (number): 평균 정확도
-   `feedback` (map, optional): 운동 후 피드백
    -   `rating` (number): 평점
    -   `comment` (string): 코멘트

### 2.3. `dailyHealthChecks`
매일의 건강 상태 기록을 저장합니다. 문서 ID는 `userId_YYYY-MM-DD` 형식입니다.

-   `userId` (string): 사용자 `uid`
-   `date` (string): 기록 날짜 (e.g., "2024-08-10")
-   `timestamp` (string): 저장 시점의 ISO 형식 타임스탬프
-   `bodyCondition` (number): 전반적인 몸 상태 (1-5)
-   `mood` (number): 오늘의 기분 (0: 매우 나쁨 - 4: 매우 좋음)
-   `armShoulderPain` (number): 팔/어깨 통증 수준 (1-5)
-   `stiffnessLevel` (number): 뻣뻣함 수준 (1-5)
-   `swellingLevel` (number): 붓기 수준 (0: 없음, 1: 가벼움, 2: 심함)

### 2.4. `weeklyReports`
Firebase Functions를 통해 생성되는 주간 리포트를 저장합니다.

-   `userId` (string): 사용자 `uid`
-   `weekStart` (string): 리포트 시작일
-   `weekEnd` (string): 리포트 종료일
-   `generatedAt` (Timestamp): 리포트 생성 시각
-   `isAIGenerated` (boolean): Gemini AI 생성 여부
-   `aiSummary` (string): AI가 생성한 주간 요약
-   `achievements` (array): 주간 달성 과제
-   `recommendations` (array): AI 추천 사항
-   `healthMetrics` (map): 건강 데이터 통계
-   `exerciseMetrics` (map): 운동 데이터 통계
-   `gameProgress` (map): 게임 진행 상황

### 2.5. `userInventory`
사용자가 획득한 아이템(가구, 배경 등) 목록을 저장합니다.

-   `userId` (string): 사용자 `uid`
-   `items` (map): 보유 아이템 목록 (key: item_id, value: 획득 시각)

### 2.6. `userQuests`
사용자의 퀘스트 진행 상황을 저장합니다.

-   `userId` (string): 사용자 `uid`
-   `quests` (map): 퀘스트 진행 상태 (key: quest_id, value: { completed: boolean, progress: number })

---

## 3. 주요 데이터 흐름

### 3.1. 사용자 인증 (회원가입 및 로그인)
1.  **프론트엔드 (회원가입)**: `app/Entry_page/Signuppage.tsx`에서 사용자가 ID, 비밀번호, 닉네임, 수술일을 입력합니다.
2.  **`AuthContext` 호출**: `useAuth()`의 `signUp` 함수가 호출됩니다.
3.  **Firebase 호출**: `firebase.config.ts`의 `signUpWithCustomId` 함수가 실행됩니다.
    -   Firebase Auth에 이메일(ID), 비밀번호로 신규 유저를 생성합니다.
    -   성공 시, 반환된 `uid`를 문서 ID로 하여 `users` 컬렉션에 닉네임, 수술일 등 초기 프로필 데이터를 저장합니다.
4.  **프론트엔드 (로그인)**: `Loginpage.tsx`에서 ID, 비밀번호를 입력하면 `signIn` 함수가 호출되어 Firebase Auth를 통해 인증을 수행하고, 성공 시 `users` 컬렉션에서 프로필 정보를 가져와 앱 상태를 업데이트합니다.

### 3.2. AI 운동 데이터 처리
1.  **프론트엔드 (운동 시작)**: `app/Exercise/ExerciseDo.tsx`에서 '운동 시작' 버튼을 누릅니다.
2.  **FastAPI 서버 요청**:
    -   `/exercise/configure`: 현재 수행할 운동의 종류(e.g., `arm_raise`)를 서버에 알립니다.
    -   `/exercise/start`: 운동 세션을 시작하도록 요청합니다.
    -   프론트엔드는 `/video/ai` 엔드포인트를 통해 AI가 분석하는 영상 스트림을 화면에 표시합니다.
    -   동시에, 주기적으로(1초마다) `/exercise/data` 엔드포인트를 호출하여 현재 운동 횟수, 정확도, 경과 시간 데이터를 받아 화면에 업데이트합니다.
3.  **프론트엔드 (운동 종료)**: '운동 종료' 버튼을 누르면 FastAPI 서버의 `/exercise/stop`을 호출하여 세션을 종료합니다.
4.  **Firestore 저장**: 운동이 완전히 종료되면 (`ExerciseSummaryPage` 이동 시점), `ExerciseContext`에 기록된 최종 운동 결과(총 소요 시간, 운동 목록 등)를 `userExercises` 컬렉션에 저장하고, 보상으로 획득한 재화를 `users` 컬렉션의 `gameData.currency` 필드에 업데이트합니다.

### 3.3. 재화 및 인게임 데이터 관리 (꽃 키우기)
1.  **데이터 소스**: 꽃의 성장률(`progress`)은 `ProgressContext`에서 관리되며, 이는 `AsyncStorage`를 통해 기기에 저장되어 영속성을 가집니다.
2.  **성장률 증가**: 사용자가 운동을 완료하거나 특정 퀘스트를 달성하면 `addProgress` 함수가 호출되어 꽃의 성장률이 증가합니다.
3.  **꽃 획득**: `app/Menu/Flowermanage.tsx`에서 `progress`가 100%에 도달하면, 해당 꽃이 '획득' 처리됩니다.
    -   `addObtainedFlower` 함수가 호출되어 `obtainedFlowers` 목록(Context 내 상태)에 추가됩니다.
    -   획득한 꽃 정보는 `userInventory` 컬렉션에 저장될 수 있습니다 (현재 코드에서는 Context에서 관리되나, 영구 저장을 위해 Firestore 사용이 유력).
    -   다음 꽃으로 자동 전환되고 `progress`는 0으로 초기화됩니다.

### 3.4. 주간 리포트 생성 (Firebase Functions)
1.  **트리거**:
    -   **자동**: `functions/src/index.ts`에 정의된 `scheduleWeeklyReports` 함수가 매주 월요일 오전 8시(한국 시간)에 실행됩니다.
    -   **수동**: 앱에서 특정 버튼을 눌러 `triggerReportGeneration` 함수를 호출할 수 있습니다.
2.  **실행**: 함수가 트리거되면 모든 활성 사용자의 `uid` 목록을 가져옵니다.
3.  **데이터 수집**: 각 사용자에 대해 지난 7일간의 `dailyHealthChecks`와 `userExercises` 데이터를 Firestore에서 수집합니다.
4.  **AI 분석 (Gemini)**: 수집된 데이터를 바탕으로 Gemini AI API를 호출하여 사용자 맞춤형 요약, 격려 메시지, 추천 사항 등을 포함하는 분석 텍스트를 생성합니다.
5.  **리포트 저장**: AI 분석 결과와 기본 통계 데이터를 결합하여 `weeklyReports` 컬렉션에 새로운 리포트 문서를 생성/저장합니다.
6.  **프론트엔드 조회**: 사용자는 앱의 '리포트' 페이지에서 자신의 `uid`로 `weeklyReports` 컬렉션을 조회하여 주간 리포트를 확인할 수 있습니다.
