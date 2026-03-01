import type { FlowNode } from "@/types/flowstate";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type PrintNodeAsPdfOptions = {
  isDarkMode: boolean;
};

export function printNodeAsPdf(node: FlowNode, options: PrintNodeAsPdfOptions): boolean {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
  if (!printWindow) return false;

  const title = escapeHtml(node.title || "Untitled");
  const content = escapeHtml(node.content || "");
  const isDark = options.isDarkMode;

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: ${isDark ? "dark" : "light"};
        --bg: ${isDark ? "#0b1118" : "#f6f6f4"};
        --panel: ${isDark ? "#0f1722" : "#ffffff"};
        --line: ${isDark ? "#314154" : "#e4e4e1"};
        --text: ${isDark ? "#e5e7eb" : "#191919"};
        --muted: ${isDark ? "#94a3b8" : "#6b7280"};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: "Avenir Next", "SF Pro Text", "Helvetica Neue", "Segoe UI", sans-serif;
      }
      .sheet {
        max-width: 900px;
        margin: 0 auto;
        min-height: 100vh;
        background: var(--panel);
        border-left: 1px solid var(--line);
        border-right: 1px solid var(--line);
        padding: 52px 56px 64px;
      }
      h1 {
        margin: 0 0 18px;
        font-size: 44px;
        line-height: 1.1;
        letter-spacing: -0.02em;
        font-weight: 600;
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 15px;
        line-height: 1.9;
        color: var(--text);
        font-family: "Avenir Next", "SF Pro Text", "Helvetica Neue", "Segoe UI", sans-serif;
      }
      .meta {
        margin-top: 24px;
        font-size: 12px;
        color: var(--muted);
      }
      @media print {
        body { background: var(--panel); }
        .sheet {
          max-width: none;
          margin: 0;
          border: 0;
          min-height: auto;
          padding: 40px 44px;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <h1>${title}</h1>
      <pre>${content}</pre>
      <p class="meta">Exported from Excelora</p>
    </main>
  </body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.onafterprint = () => {
    printWindow.close();
  };

  return true;
}
