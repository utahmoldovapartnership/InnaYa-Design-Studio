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
const API_ESCAPED_PLACEHOLDER = "__KEYSTATIC_API_ROUTE_ESCAPED__";

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

function isApiGenericFile(filePath) {
  return path.basename(filePath).startsWith("keystatic-core-api-generic");
}

function patchApiGenericRedirects(source) {
  // Repair route parser if a previous patch corrupted cached node_modules.
  let next = source
    .split("pathname.replace(/^\\/api\\/edit\\/?/")
    .join("pathname.replace(/^\\/api\\/keystatic\\/?/");

  if (!next.includes("/keystatic")) {
    return next;
  }

  // Rewrite admin UI redirects only. Never touch /api/keystatic route parsing.
  return next
    .split("redirect('/keystatic/")
    .join("redirect('/edit/")
    .split('redirect("/keystatic/')
    .join('redirect("/edit/')
    .split("return redirect('/keystatic")
    .join("return redirect('/edit")
    .split("return redirect(`/keystatic")
    .join("return redirect(`/edit");
}

function patchUiContent(source) {
  if (!source.includes("/keystatic") && !source.includes("\\/keystatic")) {
    return source;
  }

  // Protect API routes in both plain strings and escaped regex literals.
  let next = source.split("/api/keystatic").join(API_PLACEHOLDER);
  next = next.split("\\/api\\/keystatic").join(API_ESCAPED_PLACEHOLDER);

  next = next.split("/keystatic").join("/edit");
  next = next.split("\\/keystatic").join("\\/edit");

  next = next.split(API_ESCAPED_PLACEHOLDER).join("\\/api\\/keystatic");
  next = next.split(API_PLACEHOLDER).join("/api/keystatic");

  return next;
}

function patchContent(source, filePath) {
  if (isApiGenericFile(filePath)) {
    return patchApiGenericRedirects(source);
  }

  return patchUiContent(source);
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
  let updated = patchContent(original, filePath);
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
