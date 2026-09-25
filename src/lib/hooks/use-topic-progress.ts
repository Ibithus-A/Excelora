"use client";
import { lessonIdentity } from "@/lib/lesson-progress";

import { createClient } from "@/lib/supabase/client";
import type { AuthenticatedAccount } from "@/types/auth";
import type {
  TopicProgressController,
  TopicProgressMetadata,
  TopicProgressRow,
} from "@/types/topic-progress";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseTopicProgressOptions = {
  currentUser: AuthenticatedAccount | null;
  targetStudentId: string | null;
};

const EMPTY_CONTROLLER: TopicProgressController = {
  rows: [],
  rowsByTopicId: {},
  lessonProgress: {},
  currentSubtopicId: null,
  isLoading: false,
  error: "",
  canMutate: false,
  refresh: async () => {},
  setCurrentTopic: async () => {},
  markNotesCompleted: async () => {},
  markTopicCompleted: async () => {},
  markTopicTodo: async () => {},
};

function normalizeRow(value: unknown): TopicProgressRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<TopicProgressRow>;
  if (typeof row.id !== "string") return null;
  if (typeof row.student_id !== "string") return null;
  if (typeof row.topic_id !== "string") return null;
  if (typeof row.topic_title !== "string") return null;
  if (
    row.status !== "todo" &&
    row.status !== "current" &&
    row.status !== "completed"
  ) {
    return null;
  }

  return {
    id: row.id,
    student_id: row.student_id,
    topic_id: row.topic_id,
    topic_title: row.topic_title,
    chapter_title:
      typeof row.chapter_title === "string" ? row.chapter_title : null,
    subject_title:
      typeof row.subject_title === "string" ? row.subject_title : null,
    status: row.status,
    watched_video: Boolean(row.watched_video),
    started_at: typeof row.started_at === "string" ? row.started_at : null,
    completed_at:
      typeof row.completed_at === "string" ? row.completed_at : null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
}

function toPlaceholderRow(
  currentUser: AuthenticatedAccount,
  metadata: TopicProgressMetadata,
  status: TopicProgressRow["status"],
): TopicProgressRow {
  const now = new Date().toISOString();

  return {
    id: `${currentUser.id}:${metadata.topicId}`,
    student_id: currentUser.id,
    topic_id: metadata.topicId,
    topic_title: metadata.topicTitle,
    chapter_title: metadata.chapterTitle,
    subject_title: metadata.subjectTitle,
    status,
    watched_video: status === "completed",
    started_at: status === "todo" ? null : now,
    completed_at: status === "completed" ? now : null,
    updated_at: now,
  };
}

function mergeRowsByTopicId(rows: TopicProgressRow[]): TopicProgressRow[] {
  const rowsByTopicId = new Map<string, TopicProgressRow>();

  for (const row of rows) {
    rowsByTopicId.set(row.topic_id, row);
  }

  return Array.from(rowsByTopicId.values()).sort((left, right) =>
    right.updated_at.localeCompare(left.updated_at),
  );
}

function metadataToRpcArgs(metadata: TopicProgressMetadata) {
  return {
    p_topic_id: metadata.topicId,
    p_topic_title: metadata.topicTitle,
    p_chapter_title: metadata.chapterTitle,
    p_subject_title: metadata.subjectTitle ?? "",
  };
}

export function useTopicProgress({
  currentUser,
  targetStudentId,
}: UseTopicProgressOptions): TopicProgressController {
  const [rows, setRows] = useState<TopicProgressRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const currentUserId = currentUser?.id ?? null;
  const currentUserRole = currentUser?.role ?? null;
  const canMutate = Boolean(
    currentUserId &&
    currentUserRole === "student" &&
    targetStudentId === currentUserId,
  );

  const requestVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    if (!currentUserId || !targetStudentId) {
      setRows([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: progressError } = await supabase
        .from("student_topic_progress")
        .select(
          "id, student_id, topic_id, topic_title, chapter_title, subject_title, status, watched_video, started_at, completed_at, updated_at",
        )
        .eq("student_id", targetStudentId)
        .order("updated_at", { ascending: false });

      if (version !== requestVersion.current) return;
      if (progressError) throw progressError;
      setRows(
        mergeRowsByTopicId(
          (data ?? [])
            .map(normalizeRow)
            .filter((row): row is TopicProgressRow => Boolean(row)),
        ),
      );
    } catch (caught) {
      if (version !== requestVersion.current) return;
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to load topic progress.";
      setError(message);
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [currentUserId, targetStudentId]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 45000);
    return () => {
      requestVersion.current += 1;
      window.clearInterval(timer);
    };
  }, [refresh]);

  const applyOptimisticRow = useCallback(
    (metadata: TopicProgressMetadata, status: TopicProgressRow["status"]) => {
      if (!currentUser) return;
      const nextRow = toPlaceholderRow(currentUser, metadata, status);

      setRows((current) => {
        const withoutTopic = current.filter(
          (row) => row.topic_id !== metadata.topicId,
        );
        const withoutCurrent =
          status === "current"
            ? withoutTopic.map((row) =>
                row.status === "current"
                  ? {
                      ...row,
                      status: "todo" as const,
                      watched_video: false,
                      completed_at: null,
                    }
                  : row,
              )
            : withoutTopic;

        return status === "todo"
          ? withoutCurrent
          : [nextRow, ...withoutCurrent];
      });
    },
    [currentUser],
  );

  const callProgressRpc = useCallback(
    async (rpcName: string, metadata: TopicProgressMetadata) => {
      if (!canMutate) return;
      setError("");

      try {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc(
          rpcName,
          metadataToRpcArgs(metadata),
        );
        if (rpcError) throw rpcError;
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Unable to save topic progress.";
        setError(message);
        await refresh();
      }
    },
    [canMutate, refresh],
  );

  const setCurrentTopic = useCallback(
    async (metadata: TopicProgressMetadata) => {
      if (!canMutate) return;
      applyOptimisticRow(metadata, "current");
      await callProgressRpc("set_current_topic", metadata);
    },
    [applyOptimisticRow, callProgressRpc, canMutate],
  );

  const markTopicCompleted = useCallback(
    async (metadata: TopicProgressMetadata) => {
      if (!canMutate) return;
      applyOptimisticRow(metadata, "completed");
      await callProgressRpc("mark_topic_completed", metadata);
    },
    [applyOptimisticRow, callProgressRpc, canMutate],
  );

  const markNotesCompleted = useCallback(
    async (metadata: TopicProgressMetadata) => {
      if (!canMutate) return;
      setError("");
      try {
        const response = await fetch("/api/student-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "complete-notes", ...metadata }),
        });
        const data = await response.json();
        if (!response.ok) throw Error(data.error);
        await refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to save lesson progress.",
        );
      }
    },
    [canMutate, refresh],
  );

  const markTopicTodo = useCallback(
    async (metadata: TopicProgressMetadata) => {
      if (!canMutate) return;
      const matches = rows.filter(
        (row) =>
          lessonIdentity(
            row.subject_title,
            row.chapter_title,
            row.topic_title,
          ) ===
          lessonIdentity(
            metadata.subjectTitle,
            metadata.chapterTitle,
            metadata.topicTitle,
          ),
      );
      for (const row of matches.length
        ? matches
        : [{ topic_id: metadata.topicId }]) {
        const existing = { ...metadata, topicId: row.topic_id };
        applyOptimisticRow(existing, "todo");
        await callProgressRpc("mark_topic_todo", existing);
      }
    },
    [applyOptimisticRow, callProgressRpc, canMutate, rows],
  );

  return useMemo(() => {
    if (!currentUserId || !targetStudentId) return EMPTY_CONTROLLER;

    const rowsByTopicId = Object.fromEntries(
      rows.map((row) => [row.topic_id, row]),
    );
    const lessonProgress = Object.fromEntries(
      rows.map((row) => [
        row.topic_id,
        row.status === "completed" || row.watched_video,
      ]),
    );
    const currentSubtopicId =
      rows.find((row) => row.status === "current")?.topic_id ?? null;

    return {
      rows,
      rowsByTopicId,
      lessonProgress,
      currentSubtopicId,
      isLoading,
      error,
      canMutate,
      refresh,
      setCurrentTopic,
      markNotesCompleted,
      markTopicCompleted,
      markTopicTodo,
    };
  }, [
    canMutate,
    currentUserId,
    error,
    isLoading,
    markTopicCompleted,
    markNotesCompleted,
    markTopicTodo,
    refresh,
    rows,
    setCurrentTopic,
    targetStudentId,
  ]);
}
