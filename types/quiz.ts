export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  colorSwatch?: string[];
}

export interface QuizQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: QuizOption[];
  type: 'single-select' | 'multi-select';
}

export interface QuizResponse {
  questionId: string;
  selectedOptionIds: string[];
  timestamp: number;
}

export interface QuizData {
  responses: QuizResponse[];
  completedAt?: number;
  version: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  responses: QuizResponse[];
  isComplete: boolean;
}

// Quiz Questions Data
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'workspace-vibe',
    title: "What's your ideal workspace mood?",
    subtitle: 'Choose the vibe that inspires you most',
    type: 'single-select',
    options: [
      {
        id: 'focus-minimal',
        label: 'Focus & Minimal',
        description: 'Clean, distraction-free environment for deep work',
        icon: 'square.stack.3d.up',
      },
      {
        id: 'creative-inspiring',
        label: 'Creative & Inspiring',
        description: 'Vibrant space that sparks creativity and innovation',
        icon: 'paintbrush',
      },
      {
        id: 'cozy-warm',
        label: 'Cozy & Warm',
        description: 'Comfortable, welcoming atmosphere for relaxed productivity',
        icon: 'house.heart',
      },
    ],
  },
  {
    id: 'color-preference',
    title: 'Which color palette appeals to you?',
    subtitle: 'Select colors that make you feel productive',
    type: 'single-select',
    options: [
      {
        id: 'neutral-tones',
        label: 'Neutral Tones',
        description: 'Calming beiges, whites, and soft grays',
        colorSwatch: ['#F5F5F0', '#E8E4DD', '#D4CFC4', '#A8A39A'],
      },
      {
        id: 'bold-accents',
        label: 'Bold Accents',
        description: 'Energizing pops of color with strong contrasts',
        colorSwatch: ['#D96A5F', '#4A8A76', '#F39C12', '#2C3E50'],
      },
      {
        id: 'natural-greens',
        label: 'Natural Greens',
        description: 'Refreshing plant-inspired earth tones',
        colorSwatch: ['#6BA394', '#8FBC8F', '#98D8C8', '#A8E6CF'],
      },
    ],
  },
  {
    id: 'budget-range',
    title: "What's your furniture budget?",
    subtitle: 'Help us suggest options within your price range',
    type: 'single-select',
    options: [
      {
        id: 'budget-low',
        label: 'Under $500',
        description: 'Budget-friendly essentials and DIY solutions',
        icon: 'dollarsign.circle',
      },
      {
        id: 'budget-mid',
        label: '$500 - $1500',
        description: 'Quality pieces with good value for money',
        icon: 'dollarsign.circle.fill',
      },
      {
        id: 'budget-high',
        label: '$1500+',
        description: 'Premium furniture and complete workspace transformation',
        icon: 'banknote',
      },
    ],
  },
];
