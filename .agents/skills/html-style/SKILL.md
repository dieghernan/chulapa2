---
name: html-style
description: Review or edit HTML and Jekyll/Liquid templates for readable generated markup, consistent syntax, semantics, and accessibility in chulapa2 layouts, includes, and examples.
---

# HTML style

Read the project's `AGENTS.md` and any instructions that apply to the files
being edited. Use the [HTML Standard](https://html.spec.whatwg.org/multipage/)
to resolve questions about conformance.

## Markup conventions

- Start complete documents with an HTML doctype and use explicit `html`,
  `head`, and `body` elements. Include the page language, an early UTF-8
  declaration, a useful title, and responsive viewport metadata.
- Use lowercase element and attribute names, quote attribute values, and
  preserve the casing of IDs and paths. Close non-void elements explicitly.
- Match established indentation. Where none exists, use two spaces per nested
  level. Format logical blocks together and avoid reformatting unrelated markup.
- Prefer native Bootstrap 6 classes and components. Check markup, data
  attributes, and JavaScript hooks against the Bootstrap 6 version used by
  chulapa2. When adapting a legacy fixture, verify the rendered behavior with
  the Bootstrap 6 equivalents.
- Choose landmarks and heading levels by structure. Use links for navigation,
  buttons for actions, and visible labels for form controls. Keep IDs unique.
- Give images appropriate alt text and known intrinsic dimensions while
  preserving responsive sizing. Use empty alt text for decorative images.
  Reserve lazy loading for suitable offscreen media.

## Liquid and generated HTML

- The generated `head` and footer must be readable: one element per line,
  consistently indented by nesting, with no blank-line runs or tags joined
  on one line. Keep the generated `body` readable where practical; Markdown
  and include output may break its indentation.
- Inspect the generated HTML. Use Liquid whitespace trims around calculations
  deliberately and preserve spaces between inline words and newlines between
  emitted tags. Resolve front matter values such as page language before
  emitting the document when trailing whitespace control could join tags.
- Preserve meaningful whitespace in preformatted content, scripts, styles,
  and custom includes.
- Reuse the project's metadata and structured data conventions to avoid
  duplicates. Serialize JSON-LD as valid JSON and preserve the required script
  types for JSON-LD and JavaScript modules.

## Verification

Build representative pages covering the affected conditionals and layout
inheritance. For formatting-only changes to the head, compare titles, canonical
URLs, meta attributes, and decoded JSON-LD before and after the edit. Use the
project's relevant checks or the [Nu HTML Checker](https://validator.w3.org/nu/)
for complete generated documents.

For changes to semantics or controls, check rendered landmarks, heading order,
accessible names, keyboard operation, and visible focus. Inspect layout changes
at the relevant viewport widths.
