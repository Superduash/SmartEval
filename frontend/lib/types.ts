export type Role = "teacher" | "student";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface TeacherAnalytics {
  average_marks: number;
  highest_mark: number;
  pass_percentage: number;
  bar_chart: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  pie_chart: {
    labels: string[];
    datasets: { data: number[] }[];
  };
}

export interface StudentAnalytics {
  average: number;
  improvement: number;
  line_chart: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  pie_chart: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  suggestions: string[];
}

export interface ResultItem {
  id: number;
  student_id: number;
  exam_id: number;
  marks: number;
  feedback: string;
}

export interface NotificationItem {
  title: string;
  message: string;
}

export interface TrainerPlan {
  techniques: string[];
  weekly_plan: string[];
}

export interface ParentMessage {
  message: string;
}

export interface MemoryInsights {
  average: number;
  improvement: number;
  insights: string[];
}
