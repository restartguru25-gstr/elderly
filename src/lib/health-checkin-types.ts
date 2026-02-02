/**
 * Daily Health Check-in types.
 * Health profiling is NOT a quiz — these are wellness questions collected progressively.
 */

export type HealthQuestionType = 'yes_no_sometimes' | 'mcq_3' | 'emoji_scale';

export type HealthQuestion = {
  id: string;
  day: number;
  questionText: string;
  type: HealthQuestionType;
  options: string[];
  /** Show this question only if a previous question had this answer */
  showIfQuestionId?: string;
  showIfAnswer?: string;
  enabled: boolean;
  order: number;
  createdAt?: any;
  updatedAt?: any;
};

export type HealthCheckinAnswer = {
  userId: string;
  questionId: string;
  answer: string;
  date: string; // YYYY-MM-DD
  createdAt?: any;
};

export type HealthProfile = {
  diabetes: 'yes' | 'no' | 'unknown';
  bp: 'yes' | 'no' | 'sometimes';
  mobility: 'low' | 'medium' | 'high';
  mental_wellbeing: 'good' | 'moderate' | 'low';
  profile_last_updated: any;
};

export const QUESTION_TYPE_OPTIONS: Record<HealthQuestionType, string[]> = {
  yes_no_sometimes: ['Yes', 'No', 'Sometimes'],
  mcq_3: [], // Admin provides 3 options
  emoji_scale: ['🙂', '😐', '🙁'],
};
