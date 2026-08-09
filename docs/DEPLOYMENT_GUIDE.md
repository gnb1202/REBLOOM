# Health Report Automation - 배포 가이드

## 🚀 배포 단계별 가이드

### 1. Gemini API 키 설정

```bash
# Firebase CLI 로그인
firebase login

# Gemini API 키 설정 (프로덕션)
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"

# 로컬 테스트용 환경 변수 (선택사항)
firebase functions:config:get > functions/.runtimeconfig.json
```

### 2. Cloud Functions 빌드 및 배포

```bash
# functions 폴더로 이동
cd functions

# TypeScript 빌드
npm run build

# 루트 폴더로 돌아가기
cd ..

# Functions 배포
firebase deploy --only functions

# 특정 함수만 배포하는 경우
firebase deploy --only functions:generateEnhancedWeeklyReport
firebase deploy --only functions:scheduleWeeklyReports
```

### 3. Pub/Sub 토픽 생성 (수동 설정 필요)

```bash
# Google Cloud Console에서 또는 gcloud CLI로
gcloud pubsub topics create generate-enhanced-report
```

### 4. IAM 권한 설정

Cloud Functions가 필요한 권한:
- Firestore 읽기/쓰기
- Pub/Sub Publisher/Subscriber
- Cloud Scheduler Job Runner

### 5. 테스트 방법

#### 5.1 로컬 테스트
```bash
cd functions
npm run serve
# Firebase Emulator UI: http://localhost:4000
```

#### 5.2 수동 리포트 생성 테스트
앱에서 "Refresh" 버튼을 눌러 AI 리포트 생성 테스트

#### 5.3 스케줄러 테스트
```bash
# Cloud Console에서 스케줄러 작업 확인
# 매주 월요일 오전 8시 (한국시간)에 자동 실행
```

## 🔧 설정 확인사항

### Firebase 프로젝트 설정
- ✅ Firestore Database 활성화
- ✅ Cloud Functions 활성화  
- ✅ Cloud Pub/Sub API 활성화
- ✅ Cloud Scheduler API 활성화

### Gemini AI API
- ✅ Google AI Studio에서 API 키 생성
- ✅ API 할당량 확인
- ✅ 사용량 모니터링 설정

### 데이터베이스 인덱스
Firestore에 필요한 인덱스들이 자동으로 생성되는지 확인:
- `dailyHealthChecks` (userId, date)
- `userExercises` (userId, date)
- `weeklyReports` (userId, weekEnd)

## 📊 모니터링 설정

### Cloud Functions 로그 확인
```bash
# 실시간 로그 보기
firebase functions:log

# 특정 함수 로그만 보기
firebase functions:log --only generateEnhancedWeeklyReport
```

### 성능 모니터링
- Cloud Functions 실행 시간 모니터링
- Gemini API 응답 시간 추적
- 에러율 모니터링

## ⚠️ 트러블슈팅

### 일반적인 문제들

1. **Gemini API 키 오류**
   ```
   Error: Gemini API key not configured
   ```
   해결: `firebase functions:config:set gemini.api_key="YOUR_KEY"`

2. **권한 오류**
   ```
   Error: Permission denied
   ```
   해결: IAM 역할 확인 및 재설정

3. **타임아웃 오류**
   ```
   Error: Function execution took longer than 60s
   ```
   해결: Functions 타임아웃 설정 증가 (최대 9분)

### 비용 최적화

1. **AI 생성 빈도 조절**
   - 주간 1회로 제한
   - 실패시 재시도 로직 개선

2. **데이터베이스 읽기 최적화**
   - 필요한 필드만 조회
   - 캐싱 전략 적용

3. **Functions 메모리 최적화**
   - 128MB에서 시작해서 필요시 증가
   - Cold Start 최소화

## 🎯 성공 지표

### 기술적 지표
- ✅ 주간 리포트 생성 성공률 > 95%
- ✅ AI 분석 포함 리포트 비율 > 80%
- ✅ 평균 생성 시간 < 30초
- ✅ 함수 실행 비용 < $10/월

### 사용자 경험 지표
- ✅ AI 리포트 품질 만족도
- ✅ 개인화된 추천사항 적절성
- ✅ 사용자 참여도 증가

## 📝 유지보수 계획

### 정기 점검 사항 (월간)
- [ ] Gemini API 사용량 및 비용 검토
- [ ] 에러 로그 분석 및 개선사항 도출
- [ ] 사용자 피드백 수집 및 프롬프트 개선
- [ ] 데이터베이스 성능 최적화

### 업데이트 계획
- Phase 2: 더 정교한 AI 프롬프트 개발
- Phase 3: 다중 언어 지원
- Phase 4: 개인화된 운동 추천 시스템

---

**배포 완료 후 첫 번째 AI 리포트가 성공적으로 생성되면 자동화 시스템이 완전히 작동하는 것입니다! 🎉**