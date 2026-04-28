import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "code",
  "pre",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "loading"];

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "link", "meta"],
    FORBID_ATTR: ["style", "onerror", "onclick", "onload", "onmouseover"],
    USE_PROFILES: { html: true },
  });
}
