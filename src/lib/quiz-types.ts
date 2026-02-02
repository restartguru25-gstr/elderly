export type QuizStatus = 'live' | 'upcoming';

export type Quiz = {
  id: string;
  title: string;
  sponsorName?: string;
  /** Sponsor brand name - shown throughout the quiz */
  sponsorBrandName?: string;
  /** Sponsor brand image URL - logo shown throughout the quiz */
  sponsorBrandImageUrl?: string;
  quizDate: string;
  questionCount: number;
  status: QuizStatus;
  createdAt?: any;
  updatedAt?: any;
};

export type QuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  order: number;
};
