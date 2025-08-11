// Exercise Instructions and Details
export interface ExerciseInstruction {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetArea: string;
  instructions: string[];
  repetitions: number;
  duration: string;
  holdTime?: number; // in seconds
  video?: string; // video file path (to be added later)
}

export const EXERCISE_INSTRUCTIONS: Record<string, ExerciseInstruction> = {
  'biceps_curl': {
    id: 'biceps_curl',
    name: 'Biceps Curl',
    difficulty: 'Hard',
    targetArea: 'Arm',
    instructions: [
      'Keep your chest up and extend your arms straight forward.',
      'With your elbows fixed to your sides, bend your arms and bring your hands toward your shoulders.',
      'Slowly straighten your arms back to the starting position.',
      'Repeat 5 times.'
    ],
    repetitions: 5,
    duration: '2 min',
    video: '../../assets/guidevideo/Bicep_curl_guide.mp4',
  },
  
  'neck_stretch': {
    id: 'neck_stretch',
    name: 'Neck Stretch',
    difficulty: 'Easy',
    targetArea: 'Neck',
    instructions: [
      'Slowly move your neck left, right, forward, and backward to stretch.',
      'Hold each position for 2–3 seconds.',
      'Perform 5 times slowly.'
    ],
    repetitions: 5,
    duration: '2 min',
    holdTime: 3,
    video: '../../assets/guidevideo/Neck_Stretching_guide.mp4',
  },
  
  'lateral_raise': {
    id: 'lateral_raise',
    name: 'Lateral Raise',
    difficulty: 'Hard',
    targetArea: 'Shoulder',
    instructions: [
      'With your elbows slightly bent, raise your arms out to the sides until they reach shoulder height.',
      'Slowly lower your arms back down.',
      'Repeat 5 times.'
    ],
    repetitions: 5,
    duration: '2 min',
    video: '../../assets/guidevideo/Lateral_raise_guide.mp4',
  },
  
  'shoulder_abduction_1': {
    id: 'shoulder_abduction_1',
    name: 'Shoulder Abduction 1',
    difficulty: 'Easy',
    targetArea: 'Shoulder',
    instructions: [
      'Keep your elbows bent and arms close to your torso.',
      'Lift your arms sideways so they move away from your armpits.',
      'Raise your arms up to a 90-degree range if possible.',
      'Perform 5 times slowly.'
    ],
    repetitions: 5,
    duration: '2 min',
    video: '../../assets/guidevideo/Shoulder_abduction1_guide.mp4',
  },
  
  'shoulder_abduction_2': {
    id: 'shoulder_abduction_2',
    name: 'Shoulder Abduction 2',
    difficulty: 'Easy',
    targetArea: 'Shoulder',
    instructions: [
      'Raise your arm sideways so your hand passes over your head.',
      'Hold for 5 seconds within a comfortable range.',
      'Slowly lower your arm.',
      'Repeat 5 times.'
    ],
    repetitions: 5,
    duration: '2 min',
    holdTime: 5,
    video: '../../assets/guidevideo/Shoulder_abduction2_guide.mp4',
  },
  
  'shoulder_external_rotation_2': {
    id: 'shoulder_external_rotation_2',
    name: 'Shoulder External Rotation 2',
    difficulty: 'Medium',
    targetArea: 'Shoulder',
    instructions: [
      'Bend your elbow at 90 degrees and lift your arm so your hand reaches your forehead.',
      'Hold this position for 5 seconds.',
      'Slowly lower your arm.',
      'Repeat 5 times.'
    ],
    repetitions: 5,
    duration: '2 min',
    holdTime: 5,
    video: '../../assets/guidevideo/Shoulder_External_Rotation2_guide.mp4',
  },
  
  'shoulder_external_rotation_3': {
    id: 'shoulder_external_rotation_3',
    name: 'Shoulder External Rotation 3',
    difficulty: 'Medium',
    targetArea: 'Shoulder',
    instructions: [
      'Keep your chest open and raise your arm so your palm touches the back of your neck.',
      'Hold for 10 seconds within a comfortable range without straining your shoulder or arm.',
      'Slowly return to the starting position.',
      'Repeat 5 times.'
    ],
    repetitions: 5,
    duration: '3 min',
    holdTime: 10,
    video: '../../assets/guidevideo/Shoulder_External_Rotation3_guide.mp4',
  },
  
  'shoulder_flexion': {
    id: 'shoulder_flexion',
    name: 'Shoulder Flexion',
    difficulty: 'Easy',
    targetArea: 'Arm',
    instructions: [
      'Position the elbow of the affected arm so it faces forward.',
      'Use your opposite hand to support the elbow and gently lift your arm upward.',
      'Hold for 5 seconds within a pain-free range, then slowly lower it.',
      'Repeat 5 times.'
    ],
    repetitions: 5,
    duration: '2 min',
    holdTime: 5,
    video: '../../assets/guidevideo/Shoulder_flexion_guide.mp4',
  },
};

// Helper function to get exercise instruction by ID
export function getExerciseInstruction(id: string): ExerciseInstruction | undefined {
  return EXERCISE_INSTRUCTIONS[id];
}

// Helper function to get all exercise instructions
export function getAllExerciseInstructions(): ExerciseInstruction[] {
  return Object.values(EXERCISE_INSTRUCTIONS);
}

// Helper function to get exercises by difficulty
export function getExercisesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): ExerciseInstruction[] {
  return Object.values(EXERCISE_INSTRUCTIONS).filter(ex => ex.difficulty === difficulty);
}

// Helper function to get exercises by target area
export function getExercisesByTargetArea(targetArea: string): ExerciseInstruction[] {
  return Object.values(EXERCISE_INSTRUCTIONS).filter(ex => 
    ex.targetArea.toLowerCase() === targetArea.toLowerCase()
  );
}