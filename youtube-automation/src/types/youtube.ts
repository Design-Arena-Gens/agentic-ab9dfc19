export type KeywordScore = {
  keyword: string;
  score: number;
};

export type ScheduleInsight = {
  bestDay: string;
  bestTimeWindow: string;
  uploadCadence: string;
};

export type AutomationIdea = {
  title: string;
  description: string;
};

export type VideoInsight = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  publishedDay: string;
  publishedTime: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
};

export type ChannelOverview = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  customUrl: string;
  uploadsPlaylist: string;
};

export type ChannelAutomationPayload = {
  channel: ChannelOverview;
  videos: VideoInsight[];
  insights: {
    keywords: KeywordScore[];
    schedule: ScheduleInsight;
    automationIdeas: AutomationIdea[];
  };
};

export type AutomationTask = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  cadence: string;
  owner: string;
  goal: string;
  status: "draft" | "active";
  createdAt: string;
};
