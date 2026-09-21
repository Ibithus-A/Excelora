import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const root = process.argv[2];
const validateOnly = process.argv.includes("--validate-only");
if (!root) throw new Error("Usage: npm run bank:import -- /path/to/Excelora_All_Maths_Assessment_Banks_v1 [--validate-only]");

const readJson = async (relative) => JSON.parse(await readFile(path.join(root, relative), "utf8"));
const mapping = await readJson("all_course_topic_map.json");
const files = [
  "Pure/pure_bank_all_chapters.json",
  "Mechanics/mechanics_bank_all_chapters.json",
  "Statistics/statistics_bank_all_chapters.json",
];
const packages = await Promise.all(files.map(readJson));
const questions = packages.flatMap((item) => item.questions);
const keyByDomainChapter = new Map(mapping.map((item) => [
  `${item.domain}::${String(item.chapter).replace(/^\d+\s+/, "").toLowerCase()}`,
  item.course_topic_key,
]));
const allowedDifficulty = new Set(["Foundation", "Standard", "Stretch"]);
const requiredText = ["id", "qualification", "domain", "chapter", "subtopic", "family", "difficulty", "response_type", "prompt", "answer", "worked_solution", "fingerprint"];
const ids = new Set(); const fingerprints = new Set(); const errors = [];

const rows = questions.map((question, index) => {
  for (const field of requiredText) if (typeof question[field] !== "string" || !question[field].trim()) errors.push(`${index + 1}: invalid ${field}`);
  if (ids.has(question.id)) errors.push(`${question.id}: duplicate id`); else ids.add(question.id);
  if (fingerprints.has(question.fingerprint)) errors.push(`${question.id}: duplicate fingerprint ${question.fingerprint}`); else fingerprints.add(question.fingerprint);
  if (!allowedDifficulty.has(question.difficulty)) errors.push(`${question.id}: invalid difficulty`);
  if (!Number.isInteger(question.marks) || question.marks < 1) errors.push(`${question.id}: invalid marks`);
  const courseTopicKey = question.course_topic_key ?? keyByDomainChapter.get(`${question.domain}::${question.chapter.toLowerCase()}`);
  if (!courseTopicKey || !mapping.some((item) => item.course_topic_key === courseTopicKey)) errors.push(`${question.id}: unmapped course topic`);
  return {
    id: question.id, qualification: question.qualification, domain: question.domain,
    course_stage: question.course_stage ?? null, course_topic_key: courseTopicKey,
    chapter: question.chapter, subtopic: question.subtopic, spec_refs: question.spec_refs ?? [],
    family: question.family, variant: question.variant, difficulty: question.difficulty,
    marks: question.marks, response_type: question.response_type, prompt: question.prompt,
    answer: question.answer, worked_solution: question.worked_solution,
    tags: question.tags ?? [], fingerprint: question.fingerprint,
    exposed_in_notes: Boolean(question.exposed_in_notes),
    generated_original: Boolean(question.generated_original), source_version: "v1",
  };
});

const counts = Object.fromEntries(mapping.map((item) => [item.course_topic_key, rows.filter((q) => q.course_topic_key === item.course_topic_key).length]));
for (const [key, count] of Object.entries(counts)) if (count < 15) errors.push(`${key}: only ${count} questions`);
console.log(JSON.stringify({ questions: rows.length, uniqueIds: ids.size, uniqueFingerprints: fingerprints.size, mappedTopics: Object.keys(counts).length, errors: errors.slice(0, 100) }, null, 2));
if (errors.length) throw new Error(`Question-bank validation failed with ${errors.length} error(s)`);
if (validateOnly) process.exit(0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
for (let offset = 0; offset < rows.length; offset += 250) {
  const { error } = await supabase.from("assessment_question_bank").upsert(rows.slice(offset, offset + 250), { onConflict: "id" });
  if (error) throw new Error(`Import failed at row ${offset}: ${error.message}`);
  console.log(`Imported ${Math.min(offset + 250, rows.length)}/${rows.length}`);
}
