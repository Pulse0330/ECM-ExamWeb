// src/types/home.ts
export interface Announcement {
    title: string;
    descr: string;
    filename: string | null;
    url: string;
  }
  
  export interface ExamPackage {
    planid: number;
    title: string;
    expired: string;
    amount: number;
    ispay: number;
    paydescr: string;
    rate: string;
    filename: string | null;
    ispurchased: number;
    catname: string | null;
    catid: number | null;
    bill_type: number;
  }
  
  export interface SuggestedExam {
    name: string;
    date: string;
    time: string;
    countdown: string;
    reason: string;
    teacher: string;
  }
  
  export interface UserProfile {
    username: string;
    // шаардлагатай бол бусад талбарыг нэмнэ
  }
  
  interface HomeScreenData {
    RetDataFirst: Announcement[];
    RetDataSecond: ExamPackage[];
    RetDataThirt: SuggestedExam[];
    completionRate: number;
    latestScore: number;
    totalExams: number;
    lastActivityExam: string;
  }
  
  