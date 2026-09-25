export type TopicProgressStatus = "todo" | "current" | "completed";

export type TopicProgressRow = {
  id: string;
  student_id: string;
  topic_id: string;
  topic_title: string;
  chapter_title: string | null;
  subject_title: string | null;
  status: TopicProgressStatus;
  watched_video: boolean;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type TopicProgressMetadata = {
  topicId: string;
  topicTitle: string;
  chapterTitle: string;
  subjectTitle: string | null;
};

export type TopicProgressController = {
  rows: TopicProgressRow[];
  rowsByTopicId: Record<string, TopicProgressRow>;
  lessonProgress: Record<string, boolean>;
  currentSubtopicId: string | null;
  isLoading: boolean;
  error: string;
  canMutate: boolean;
  refresh: () => Promise<void>;
  setCurrentTopic: (metadata: TopicProgressMetadata) => Promise<void>;
  markNotesCompleted: (metadata: TopicProgressMetadata) => Promise<void>;
  markTopicCompleted: (metadata: TopicProgressMetadata) => Promise<void>;
  markTopicTodo: (metadata: TopicProgressMetadata) => Promise<void>;
};
