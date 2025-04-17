/**
 * 文物数据类型定义
 */

// 文物类型
export interface Relic {
  id: string;
  name: string;
  dynasty: string;
  category: string;
  color: string;
  image: string;
  images?: string[];
  description?: string;
  era?: string;
  location?: string;
  museum?: string;
  discoveryYear?: string;
  significance?: string[];
  relatedRelics?: string[];
  views?: number; // 浏览次数
}

// 文物分类
export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color: string; // 分类颜色
}

// 朝代
export interface Dynasty {
  id: string;
  name: string;
  period?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

// 地区
export interface Region {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  zoom: number;
  relicCount?: number;
}

// 文物地点
export interface RelicSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  regionId: string;
  relicIds?: string[];
  description?: string;
  imageUrl?: string;
  type?: 'museum' | 'site' | 'monument';
  admission?: string;
}

// 故事对话选项
export interface DialogChoice {
  text: string;
  outcome: string;
  isCorrect: boolean;
}

// 问答选项
export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

// 问答数据
export interface QuizData {
  options: QuizOption[];
  explanation: string;
}

// 故事对话
export interface Dialog {
  id: string;
  character: string;
  text: string;
  emotion?: string;
  choices?: DialogChoice[]; // 用于选择题对话
  quiz?: QuizData; // 用于问答题对话
}

// 故事交互点
export interface InteractionPoint {
  id: string;
  position: { x: number; y: number };
  type: 'item' | 'character' | 'scene';
  hintText: string;
  nextScene?: string;
  triggerDialog?: string;
}

// 故事场景
export interface Scene {
  id: string;
  backgroundColor: string;
  dialogs: Dialog[];
  interactionPoints: InteractionPoint[];
  backgroundImage?: string;
}

// 故事
export interface Story {
  id: string;
  title: string;
  relicId: string;
  summary: string;
  coverImage: string;
  content?: string;
  chapters?: StoryChapter[];
  duration?: number; // 预计阅读/体验时间（分钟）
  tags?: string[];
  scenes?: Scene[]; // 互动故事场景
  supportsLandscape?: boolean; // 标记故事是否支持横屏模式
}

// 故事章节
export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  interactions?: StoryInteraction[];
}

// 故事交互
export interface StoryInteraction {
  id: string;
  type: 'dialog' | 'choice' | 'animation' | 'quiz';
  data: any; // 交互数据，根据类型有所不同
}

// 用户收藏
export interface UserCollection {
  userId: string;
  relicIds: string[];
  storyIds: string[];
  visitedSites: string[];
  quizResults: QuizResult[];
}

// 知识问答结果
export interface QuizResult {
  quizId: string;
  date: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

// 搜索过滤器选项
export interface FilterOptions {
  category?: string;
  dynasty?: string;
  searchText?: string;
} 