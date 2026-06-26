/**
 * Patches @keystatic/core for /edit base path (replaces fragile patch-package on Linux).
 * Protects /api/keystatic routes from being rewritten.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const distDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  "@keystatic",
  "core",
  "dist",
);

const API_PLACEHOLDER = "__KEYSTATIC_API_ROUTE__";

function walkJsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(fullPath, files);
    } else if (entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

function patchContent(source) {
  if (!source.includes("/keystatic")) {
    return source;
  }

  let next = source.split("/api/keystatic").join(API_PLACEHOLDER);
  next = next.split("/keystatic").join("/edit");
  next = next.split(API_PLACEHOLDER).join("/api/keystatic");

  return next;
}

function patchUkStrings(source) {
  if (!source.includes('"uk-UA"')) {
    return source;
  }

  return source
    .split('"dashboard": `Дашборд`')
    .join('"dashboard": `Головна`')
    .split('"collection": `Колекція`')
    .join('"collection": `Сторінка`')
    .split('"collections": `Колекції`')
    .join('"collections": `Сторінки`')
    .split('"singletons": `Одиночки`')
    .join('"singletons": `Сторінки`')
    .split('"singleton": `Одиночка`')
    .join('"singleton": `Сторінка`');
}

function patchUiBreadcrumb(source, filePath) {
  if (!filePath.endsWith("keystatic-core-ui.js")) {
    return source;
  }

  let next = source.split('children: "Dashboard"').join('children: "Головна"');

  const breadcrumbItem = `      t1 = item => /*#__PURE__*/jsx(Item, {
        href: item.href,
        children: item.label
      }, item.key);`;

  const breadcrumbItemPatched = `      t1 = item => /*#__PURE__*/jsx(Item, {
        ...(item.href ? {
          href: item.href
        } : {}),
        children: item.label
      }, item.key);`;

  if (next.includes(breadcrumbItem)) {
    next = next.split(breadcrumbItem).join(breadcrumbItemPatched);
  }

  const headerAction = `    t12 = item => /*#__PURE__*/jsxs(Item$1, {
      textValue: item.label,
      href: item.href,
      target: item.target,
      rel: item.rel,
      children: [/*#__PURE__*/jsx(Icon, {`;

  const headerActionPatched = `    t12 = item => /*#__PURE__*/jsxs(Item$1, {
      textValue: item.label,
      ...(item.href ? {
        href: item.href,
        target: item.target,
        rel: item.rel
      } : {}),
      children: [/*#__PURE__*/jsx(Icon, {`;

  if (next.includes(headerAction)) {
    next = next.split(headerAction).join(headerActionPatched);
  }

  const singletonAction = `    t18 = item => /*#__PURE__*/jsxs(Item$1, {
      textValue: item.label,
      href: item.href,
      target: item.target,
      rel: item.rel,
      children: [/*#__PURE__*/jsx(Icon, {`;

  const singletonActionPatched = `    t18 = item => /*#__PURE__*/jsxs(Item$1, {
      textValue: item.label,
      ...(item.href ? {
        href: item.href,
        target: item.target,
        rel: item.rel
      } : {}),
      children: [/*#__PURE__*/jsx(Icon, {`;

  if (next.includes(singletonAction)) {
    next = next.split(singletonAction).join(singletonActionPatched);
  }

  return next;
}

let patchedFiles = 0;

for (const filePath of walkJsFiles(distDir)) {
  const original = fs.readFileSync(filePath, "utf8");
  let updated = patchContent(original);
  updated = patchUkStrings(updated);
  updated = patchUiBreadcrumb(updated, filePath);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    patchedFiles += 1;
  }
}

if (patchedFiles === 0) {
  console.warn("patch-keystatic: no files updated — is @keystatic/core installed?");
} else {
  console.log(`patch-keystatic: updated ${patchedFiles} file(s)`);
}
