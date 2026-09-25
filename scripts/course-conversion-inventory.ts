import { NATIVE_DUPLICATES } from "../src/content/notion-lessons/native-duplicates.ts";
import { A_LEVEL_MATHS_SUBJECTS } from "../src/lib/seed.ts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const browserReportPath = "docs/qa/browser/native/results.json";
const browserReport = existsSync(browserReportPath)
  ? JSON.parse(readFileSync(browserReportPath, "utf8"))
  : { results: [], errors: [] };
function renderingPassed(id: string) {
  return (
    browserReport.errors.length === 0 &&
    [320, 430, 1280].every((width) =>
      browserReport.results.some(
        (r: {
          id: string;
          width: number;
          overflow: boolean;
          katexErrors: number;
          labelLineCollisions: string[];
          labelCurveCollisions?: string[];
          labelLabelCollisions?: string[][];
        }) =>
          r.id === id &&
          r.width === width &&
          !r.overflow &&
          !r.katexErrors &&
          !r.labelLineCollisions.length &&
          !r.labelCurveCollisions?.length &&
          !r.labelLabelCollisions?.length,
      ),
    )
  );
}
const rows = A_LEVEL_MATHS_SUBJECTS.flatMap((subject) =>
  subject.chapters.flatMap((chapter) =>
    chapter.subtopics
      .filter((t) => /^\d+\.\d+\s/.test(t))
      .map((title) => {
        const original = `archives/course-pdfs/${subject.title}/${title}.pdf`;
        const existing =
          subject.title === "Pure Mathematics" &&
          chapter.title.startsWith("Chapter 1:");
        const converted = NATIVE_DUPLICATES.find(
          (lesson) =>
            lesson.subjectTitle === subject.title &&
            lesson.sourceTitle === title,
        );
        return {
          subject: subject.title,
          chapter: chapter.title,
          subtopic: title,
          originalPdf: original,
          pdfPresent: existsSync(original),
          nativeDuplicate: existing
            ? title
            : converted
              ? title
              : null,
          conversionStatus: existing
            ? "existing-native"
            : converted
              ? "converted-draft"
              : "pending",
          qaStatus: existing
            ? "existing-page-not-reapproved"
            : converted
              ? renderingPassed(converted.id)
                ? "render-checks-passed-source-approval-pending"
                : "render-checks-pending-source-approval-pending"
              : "not-converted",
        };
      }),
  ),
);
writeFileSync(
  "docs/qa/pdf-native-conversion-manifest.json",
  JSON.stringify(rows, null, 2) + "\n",
);
writeFileSync(
  "docs/qa/pdf-native-conversion-manifest.csv",
  "subject,chapter,subtopic,original PDF,native duplicate,conversion status,QA status\n" +
    rows
      .map((r) =>
        [
          r.subject,
          r.chapter,
          r.subtopic,
          r.originalPdf,
          r.nativeDuplicate ?? "",
          r.conversionStatus,
          r.qaStatus,
        ]
          .map((v) => '"' + v.replaceAll('"', '""') + '"')
          .join(","),
      )
      .join("\n") +
    "\n",
);
console.log({
  lessons: rows.length,
  existingNative: rows.filter((r) => r.conversionStatus === "existing-native")
    .length,
  convertedDraft: rows.filter((r) => r.conversionStatus === "converted-draft")
    .length,
  pending: rows.filter((r) => r.conversionStatus === "pending").length,
  missingPdfs: rows.filter((r) => !r.pdfPresent).length,
});
