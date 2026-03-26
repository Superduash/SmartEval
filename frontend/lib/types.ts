export type Role = "teacher" | "student";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserProfile extends AuthUser {
  phone?: string | null;
  avatar_url?: string | null;
  timezone?: string | null;
  bio?: string | null;
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
  id: number;
  title: string;
  message: string;
  kind?: string;
  is_read?: boolean;
  created_at?: string;
}

export interface ParentContact {
  id: number;
  student_id: number;
  name: string;
  email: string;
  relationship: string;
  status: string;
  email_opt_in: boolean;
}

export interface TrainerSession {
  id: number;
  student_id: number;
  plan_id: string;
  title: string;
  elapsed_seconds: number;
  is_running: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface TeacherLink {
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  joined_at: string;
  status: string;
}

export interface StudentLink {
  student_id: number;
  student_name: string;
  student_email: string;
  joined_at: string;
  status: string;
}

export interface WaitlistLead {
  id: number;
  email: string;
  source: string;
  status: string;
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
