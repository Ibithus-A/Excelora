// One-way compiler for the legacy static JSX sources; no DOM scraping or runtime React.
// Keeps legacy visual components intact. Generated structured data is consumed by Arthur.
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const out = [];
const issues = [];
for (const filename of fs
  .readdirSync("src/components")
  .filter(
    (f) =>
      f.endsWith("-native-lesson.tsx") && f !== "structured-native-lesson.tsx",
  )) {
  const text = fs.readFileSync(path.join("src/components", filename), "utf8");
  const source = ts.createSourceFile(
    filename,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const functions = new Map();
  const constants = new Map();
  for (const stmt of source.statements) {
    if (ts.isFunctionDeclaration(stmt)) functions.set(stmt.name?.text, stmt);
    if (ts.isVariableStatement(stmt))
      for (const decl of stmt.declarationList.declarations)
        constants.set(decl.name.getText(source), decl.initializer);
  }
  function literal(node, env = {}) {
    if (!node) return "";
    if (node.kind === ts.SyntaxKind.NullKeyword) return "";
    if (ts.isParenthesizedExpression(node))
      return literal(node.expression, env);
    if (ts.isConditionalExpression(node))
      return literal(
        literal(node.condition, env) ? node.whenTrue : node.whenFalse,
        env,
      );
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "includes"
    )
      return String(literal(node.expression.expression, env)).includes(
        literal(node.arguments[0], env),
      );
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isNumericLiteral(node)
    )
      return node.text;
    if (
      ts.isTaggedTemplateExpression(node) &&
      node.tag.getText(source) === "String.raw"
    )
      return node.template.rawText ?? node.template.text;
    if (ts.isJsxExpression(node)) return literal(node.expression, env);
    if (ts.isIdentifier(node))
      return (
        env[node.text] ??
        (constants.has(node.text) ? literal(constants.get(node.text), env) : "")
      );
    if (ts.isPropertyAccessExpression(node)) {
      const object = literal(node.expression, env);
      return object?.[node.name.text] ?? "";
    }
    if (ts.isArrayLiteralExpression(node))
      return node.elements.map((n) => literal(n, env));
    if (ts.isAsExpression(node)) return literal(node.expression, env);
    if (ts.isObjectLiteralExpression(node))
      return Object.fromEntries(
        node.properties
          .filter(ts.isPropertyAssignment)
          .map((p) => [p.name.getText(source), literal(p.initializer, env)]),
      );
    return "";
  }
  const attr = (node, name, env) =>
    literal(
      node.attributes.properties.find((p) => p.name?.text === name)
        ?.initializer,
      env,
    );
  function inline(children, env) {
    return children.flatMap((n) => {
      if (ts.isJsxText(n))
        return [{ type: "text", value: n.text.replace(/\s+/g, " ") }];
      if (ts.isJsxExpression(n)) {
        if (n.expression && ts.isConditionalExpression(n.expression)) {
          const selected = literal(n.expression.condition, env)
            ? n.expression.whenTrue
            : n.expression.whenFalse;
          return inline(
            [
              ts.isParenthesizedExpression(selected)
                ? selected.expression
                : selected,
            ],
            env,
          );
        }
        const v = literal(n, env);
        return typeof v === "string" && v ? [{ type: "text", value: v }] : [];
      }
      if (
        ts.isJsxElement(n) &&
        n.openingElement.tagName.getText(source) === "MathText"
      )
        return [
          {
            type: "math",
            latex: n.children
              .map((c) => (ts.isJsxText(c) ? c.text : literal(c, env)))
              .join("")
              .trim(),
          },
        ];
      if (ts.isJsxElement(n)) return inline(n.children, env);
      return [];
    });
  }
  function blocks(nodes, env = {}) {
    return nodes.flatMap((n) => {
      if (ts.isJsxText(n))
        return n.text.trim()
          ? [{ type: "paragraph", content: inline([n], env) }]
          : [];
      if (ts.isJsxExpression(n)) {
        if (n.expression?.kind === ts.SyntaxKind.NullKeyword) return [];
        if (n.expression && ts.isConditionalExpression(n.expression)) {
          const selected = literal(n.expression.condition, env)
            ? n.expression.whenTrue
            : n.expression.whenFalse;
          return blocks(
            [
              ts.isParenthesizedExpression(selected)
                ? selected.expression
                : selected,
            ],
            env,
          );
        }
        if (
          n.expression &&
          (ts.isJsxElement(n.expression) ||
            ts.isJsxSelfClosingElement(n.expression))
        )
          return blocks([n.expression], env);
        if (
          n.expression &&
          ts.isCallExpression(n.expression) &&
          ts.isPropertyAccessExpression(n.expression.expression) &&
          n.expression.expression.name.text === "map"
        ) {
          const values = literal(n.expression.expression.expression, env),
            callback = n.expression.arguments[0];
          if (Array.isArray(values) && ts.isArrowFunction(callback))
            return values.flatMap((value) =>
              blocks(
                [
                  ts.isParenthesizedExpression(callback.body)
                    ? callback.body.expression
                    : callback.body,
                ],
                { ...env, [callback.parameters[0].name.text]: value },
              ),
            );
        }
        if (n.expression)
          issues.push({
            filename,
            expression: n.expression.getText(source).slice(0, 120),
          });
        return [];
      }
      if (!ts.isJsxElement(n) && !ts.isJsxSelfClosingElement(n)) return [];
      const opening = ts.isJsxElement(n) ? n.openingElement : n,
        tag = opening.tagName.getText(source),
        children = ts.isJsxElement(n) ? n.children : [];
      if (tag === "MathText" || tag === "DisplayMath")
        return [
          {
            type: "math",
            latex: children
              .map((c) => (ts.isJsxText(c) ? c.text : literal(c, env)))
              .join("")
              .trim(),
          },
        ];
      if (["p", "li", "h1", "h2", "h3"].includes(tag))
        return [{ type: "paragraph", content: inline(children, env) }];
      if (tag === "LessonSection")
        return [
          {
            type: "group",
            title: attr(opening, "title", env),
            children: blocks(children, env),
          },
        ];
      if (tag === "Step" || tag === "Question")
        return [
          {
            type: tag === "Step" ? "step" : "practice",
            number: Number(attr(opening, "number", env)),
            title: attr(opening, "title", env) || undefined,
            children: blocks(children, env),
          },
        ];
      if (functions.has(tag)) {
        const fn = functions.get(tag);
        const descriptions = [];
        if (tag === "ParabolaDiagram")
          return [
            {
              type: "diagram",
              description:
                attr(opening, "direction", env) === "up"
                  ? "Upward-opening parabola y=(x-2)(x-3), roots 2 and 3; y>0 outside the roots."
                  : "Downward-opening parabola y=-(x-2)(x-3), roots 2 and 3; y≥0 between and including the roots.",
            },
          ];
        const visit = (node) => {
          if (ts.isJsxAttribute(node) && node.name.text === "aria-label") {
            const v = literal(node.initializer, env);
            if (v) descriptions.push(v);
          }
          ts.forEachChild(node, visit);
        };
        visit(fn);
        if (!descriptions.length) issues.push({ filename, diagram: tag });
        return [
          {
            type: "diagram",
            description:
              descriptions.join(" ") ||
              `${tag.replace(/([a-z])([A-Z])/g, "$1 $2")}; consult the lesson diagram for exact geometry.`,
          },
        ];
      }
      if (tag === "NotionLessonRenderer") {
        const intro = opening.attributes.properties.find(
          (p) => p.name?.text === "introduction",
        )?.initializer;
        return [
          ...(intro ? blocks([intro], env) : []),
          ...blocks(children, env),
        ];
      }
      return blocks(children, env);
    });
  }
  let root;
  const find = (n) => {
    if (
      ts.isJsxElement(n) &&
      n.openingElement.tagName.getText(source) === "NotionLessonRenderer"
    )
      root = n;
    else ts.forEachChild(n, find);
  };
  find(source);
  if (!root) continue;
  const definition = root.openingElement.attributes.properties
    .find((p) => p.name?.text === "definition")
    ?.initializer?.expression?.getText(source)
    .split(".")
    .at(-1);
  out.push({ key: definition, source: filename, blocks: blocks([root]) });
}
fs.writeFileSync(
  "src/content/notion-lessons/legacy-structured.json",
  JSON.stringify(out, null, 2) + "\n",
);
fs.writeFileSync(
  "docs/qa/native-extraction-issues.json",
  JSON.stringify(issues, null, 2) + "\n",
);
console.log(
  `${out.length} native lesson sources; ${issues.length} extraction items require review`,
);
