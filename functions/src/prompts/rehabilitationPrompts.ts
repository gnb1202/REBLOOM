/**
 * Rehabilitation-focused prompt generator for breast cancer survivors
 * Specialized for post-mastectomy care and gentle rehabilitation support
 */

interface WeeklyData {
  healthChecks: any[];
  exercises: any[];
  userProfile: any;
  startDate: string;
  endDate: string;
}

interface UserData {
  level: number;
  totalExercises: number;
  consecutiveExercises: number;
  currency: number;
}

export class RehabilitationPromptGenerator {
  
  /**
   * Generate empathetic prompt focused on gentle encouragement
   */
  static generateEmpathicPrompt(userData: UserData, weeklyData: WeeklyData): string {
    const avgCondition = weeklyData.healthChecks.length > 0 
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.condition, 0) / weeklyData.healthChecks.length
      : 0;
    
    const avgSwelling = weeklyData.healthChecks.length > 0
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.swelling, 0) / weeklyData.healthChecks.length
      : 0;

    return `
You are a compassionate rehabilitation supporter specializing in post-mastectomy care for breast cancer survivors in their 40s-60s. 
You understand the unique challenges of recovery and focus on gentle, patient-centered support.
Generate supportive insights in English language.

USER CONTEXT:
- Recovery journey level: ${userData.level}
- Total gentle activities completed: ${userData.totalExercises}
- Days of consistent self-care: ${userData.consecutiveExercises}

WEEKLY RECOVERY DATA:
${JSON.stringify({
  weekPeriod: `${weeklyData.startDate} to ${weeklyData.endDate}`,
  dailyCheckIns: weeklyData.healthChecks.length,
  averageComfort: avgCondition.toFixed(1),
  averageSwelling: avgSwelling.toFixed(1),
  gentleActivities: weeklyData.exercises.length,
  totalCareTime: weeklyData.exercises.reduce((sum, ex) => sum + ex.duration, 0)
}, null, 2)}

DETAILED DAILY COMFORT RECORDS:
${JSON.stringify(weeklyData.healthChecks.slice(0, 7), null, 2)}

DETAILED GENTLE ACTIVITY RECORDS:
${JSON.stringify(weeklyData.exercises.slice(0, 10), null, 2)}

Generate a JSON response with:
{
  "greeting": "A warm, personal greeting acknowledging their courage and daily efforts",
  "wellbeingCheck": "Gentle acknowledgment of their comfort levels and any challenges this week",
  "gentleAchievements": ["2-4 specific recognitions of their efforts, consistency, or self-care moments - focus on the journey, not metrics"],
  "carefulRecommendations": ["2-4 gentle, safe suggestions tailored to their current comfort level and recovery stage"],
  "supportMessage": "An encouraging, hopeful closing that honors their strength and resilience"
}

TONE GUIDELINES:
- Use warm, understanding language that acknowledges the emotional and physical aspects of recovery
- Celebrate effort and consistency over performance metrics
- Be specific about what they've accomplished, even small steps
- Frame recommendations as gentle invitations, not prescriptions
- Honor their agency and wisdom about their own body
- Include phrases that normalize the ups and downs of recovery
- Avoid fitness-focused language; use recovery and wellness terminology instead
`;
  }

  /**
   * Generate safety-focused prompt when pain/swelling levels are concerning
   */
  static generateSafetyFocusedPrompt(userData: UserData, weeklyData: WeeklyData): string {
    const avgCondition = weeklyData.healthChecks.length > 0 
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.condition, 0) / weeklyData.healthChecks.length
      : 0;
    
    const avgSwelling = weeklyData.healthChecks.length > 0
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.swelling, 0) / weeklyData.healthChecks.length
      : 0;

    return `
You are a caring rehabilitation supporter for breast cancer survivors who prioritizes safety and medical guidance. 
The user's comfort levels this week suggest they may need additional support or medical consultation.
Generate supportive insights in English language with a focus on safety and professional guidance.

USER CONTEXT - REQUIRING GENTLE ATTENTION:
- Recovery level: ${userData.level}
- Average comfort this week: ${avgCondition.toFixed(1)}/5
- Average swelling: ${avgSwelling.toFixed(1)}/5
- Consistent self-care days: ${userData.consecutiveExercises}

WEEKLY RECOVERY DATA REQUIRING CARE:
${JSON.stringify({
  weekPeriod: `${weeklyData.startDate} to ${weeklyData.endDate}`,
  comfortConcerns: avgCondition < 3,
  swellingConcerns: avgSwelling > 3,
  checkInConsistency: weeklyData.healthChecks.length,
  gentleActivityLevel: weeklyData.exercises.length
}, null, 2)}

Generate a JSON response with:
{
  "greeting": "A gentle, caring greeting that acknowledges they may be having a challenging week",
  "wellbeingCheck": "Compassionate recognition of their discomfort and validation of their experience",
  "gentleAchievements": ["1-2 recognitions of their strength in tracking their symptoms and continuing their care"],
  "carefulRecommendations": ["Gentle suggestions to prioritize rest, comfort measures, and consider reaching out to their healthcare team if symptoms persist"],
  "supportMessage": "Reassuring message emphasizing that difficult weeks are part of recovery and they're not alone"
}

SAFETY-FOCUSED GUIDELINES:
- Acknowledge their discomfort without minimizing it
- Gently suggest consulting with their healthcare provider if concerning symptoms persist
- Focus on comfort measures and rest rather than activity
- Validate that recovery has ups and downs
- Emphasize listening to their body's wisdom
- Avoid suggesting increased activity when comfort levels are low
- Include gentle reminders about available support resources
`;
  }

  /**
   * Generate celebration prompt for consistent positive progress
   */
  static generateCelebrationPrompt(userData: UserData, weeklyData: WeeklyData): string {
    const avgCondition = weeklyData.healthChecks.length > 0 
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.condition, 0) / weeklyData.healthChecks.length
      : 0;

    return `
You are an enthusiastic rehabilitation supporter celebrating a breast cancer survivor's positive week of recovery progress.
They've shown consistent self-care and good comfort levels - this deserves genuine recognition and encouragement.
Generate celebratory insights in English language.

USER CONTEXT - CELEBRATING PROGRESS:
- Recovery journey level: ${userData.level}
- Consistent self-care streak: ${userData.consecutiveExercises} days
- Average comfort this week: ${avgCondition.toFixed(1)}/5
- Weekly gentle activities: ${weeklyData.exercises.length}

POSITIVE WEEKLY RECOVERY DATA:
${JSON.stringify({
  weekPeriod: `${weeklyData.startDate} to ${weeklyData.endDate}`,
  consistentCheckIns: weeklyData.healthChecks.length >= 5,
  goodComfortLevels: avgCondition >= 4,
  activeEngagement: weeklyData.exercises.length >= 3,
  totalSelfCareMinutes: weeklyData.exercises.reduce((sum, ex) => sum + ex.duration, 0)
}, null, 2)}

Generate a JSON response with:
{
  "greeting": "An enthusiastic, warm greeting celebrating their wonderful week",
  "wellbeingCheck": "Recognition of their good comfort levels and positive self-care patterns",
  "gentleAchievements": ["3-5 specific celebrations of their consistency, progress, and self-advocacy"],
  "carefulRecommendations": ["Encouraging suggestions to maintain their positive momentum while staying attuned to their body"],
  "supportMessage": "Inspiring message about their strength, progress, and the positive impact of their consistent self-care"
}

CELEBRATION GUIDELINES:
- Use genuinely enthusiastic but not overwhelming language
- Specifically acknowledge their consistent efforts and good choices
- Recognize both physical comfort and emotional resilience
- Encourage them to take pride in their progress
- Suggest ways to maintain momentum without pushing too hard
- Acknowledge the strength it takes to prioritize self-care consistently
- Frame their progress as inspiration for their continued journey
`;
  }

  /**
   * Determine which prompt type to use based on weekly data analysis
   */
  static selectPromptType(userData: UserData, weeklyData: WeeklyData): 'empathic' | 'safety' | 'celebration' {
    const avgCondition = weeklyData.healthChecks.length > 0 
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.condition, 0) / weeklyData.healthChecks.length
      : 0;
    
    const avgSwelling = weeklyData.healthChecks.length > 0
      ? weeklyData.healthChecks.reduce((sum, check) => sum + check.swelling, 0) / weeklyData.healthChecks.length
      : 0;

    // Safety-focused for concerning symptoms
    if (avgCondition < 3 || avgSwelling > 3) {
      return 'safety';
    }
    
    // Celebration for consistent positive week
    if (avgCondition >= 4 && weeklyData.healthChecks.length >= 5 && weeklyData.exercises.length >= 3) {
      return 'celebration';
    }
    
    // Default empathic approach
    return 'empathic';
  }

  /**
   * Generate the appropriate prompt based on user data analysis
   */
  static generatePrompt(userData: UserData, weeklyData: WeeklyData): string {
    const promptType = this.selectPromptType(userData, weeklyData);
    
    switch (promptType) {
      case 'safety':
        return this.generateSafetyFocusedPrompt(userData, weeklyData);
      case 'celebration':
        return this.generateCelebrationPrompt(userData, weeklyData);
      default:
        return this.generateEmpathicPrompt(userData, weeklyData);
    }
  }
}