import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArthurMessage } from "./schema";

type ConversationRow = { id: string; context_key: string; page_title: string };
type MessageRow = { role: "user" | "assistant"; content: string; status: string; created_at: string };

export async function getOwnedConversation(admin: SupabaseClient, userId: string, conversationId: string) {
  const { data, error } = await admin.from("arthur_conversations")
    .select("id,context_key,page_title")
    .eq("id", conversationId).eq("user_id", userId).maybeSingle<ConversationRow>();
  if (error) throw error;
  return data;
}

export async function getLatestConversation(admin: SupabaseClient, userId: string, contextKey: string) {
  const { data, error } = await admin.from("arthur_conversations")
    .select("id,context_key,page_title")
    .eq("user_id", userId).eq("context_key", contextKey)
    .order("updated_at", { ascending: false }).limit(1).maybeSingle<ConversationRow>();
  if (error) throw error;
  return data;
}

export async function createConversation(admin: SupabaseClient, input: {
  userId: string; contextKey: string; pageTitle: string; subject: string | null; chapter: string | null; topic: string | null;
}) {
  const { data, error } = await admin.from("arthur_conversations").insert({
    user_id: input.userId,
    context_key: input.contextKey,
    page_title: input.pageTitle,
    subject_title: input.subject,
    chapter_title: input.chapter,
    topic_title: input.topic,
  }).select("id,context_key,page_title").single<ConversationRow>();
  if (error) throw error;
  return data;
}

export async function listConversationMessages(admin: SupabaseClient, userId: string, conversationId: string, limit = 20) {
  const owned = await getOwnedConversation(admin, userId, conversationId);
  if (!owned) return null;
  const { data, error } = await admin.from("arthur_messages")
    .select("role,content,status,created_at")
    .eq("conversation_id", conversationId)
    .in("status", ["complete", "interrupted"])
    .order("created_at", { ascending: false }).limit(Math.min(40, Math.max(1, limit)))
    .returns<MessageRow[]>();
  if (error) throw error;
  return { conversation: owned, messages: (data ?? []).reverse() };
}

export async function appendMessage(admin: SupabaseClient, conversationId: string, message: ArthurMessage, status: "complete" | "interrupted" = "complete") {
  const { error } = await admin.from("arthur_messages").insert({
    conversation_id: conversationId,
    role: message.role,
    content: message.content,
    status,
  });
  if (error) throw error;
  await admin.from("arthur_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}

export async function logArthurRequest(admin: SupabaseClient, input: {
  requestId: string; userId: string; conversationId: string | null; provider: string; model: string; status: string; latencyMs: number;
  inputTokens?: number; outputTokens?: number; totalTokens?: number; tools?: string[]; errorCode?: string;
}) {
  const { error } = await admin.from("arthur_request_logs").insert({
    request_id: input.requestId,
    user_id: input.userId,
    conversation_id: input.conversationId,
    provider: input.provider,
    model: input.model,
    status: input.status,
    latency_ms: input.latencyMs,
    input_tokens: input.inputTokens ?? null,
    output_tokens: input.outputTokens ?? null,
    total_tokens: input.totalTokens ?? null,
    tool_names: input.tools ?? [],
    error_code: input.errorCode ?? null,
  });
  if (error) console.error("[arthur.log] unable to persist request metadata", { requestId: input.requestId, message: error.message });
}
