---
name: chulapa-blog-covers
description: Generate or revise editorial header and Open Graph images for chulapa2 release announcements and documentation blog posts.
---

# chulapa2 blog covers

- Read the article and inspect its header layout, image fields, and existing
  cover. Use the built-in image generation tool for new covers and revisions.
- Read the [visual references](references/visual-style.md) from the original
  chulapa blog and open one or two examples before prompting. Include a
  Madrid reference and carry a detail that fits the article into the composition,
  such as a photograph, a balcony, or a traditional object. For revisions, use
  the current cover as the edit target and preserve its distinctive subject
  and atmosphere.
- Use an editorial photograph with natural light, tactile materials, and a
  small number of objects related to the article. Give each cover a distinct
  focal point. Keep lettering and logos out unless requested.
- Compose for the actual header crop and verify it on desktop and mobile. For
  a shallow center crop, place recognizable details across the middle.
- Use a compressed 1200 × 630 JPEG for a new Open Graph image. Reuse it for
  the header when both crops work. A post with an intentional historical header
  photo may use a separate sharing image.
- Follow the site's asset path and front matter conventions. Use a short
  English description for the sharing image alt text when supported. Match
  the declared width, height, and media type to the file. Use a versioned
  filename for revisions to published images.
- Build the site and check the rendered header, the full sharing image, and
  the emitted metadata. If the post is syndicated and the feeds expose its
  image, verify the emitted image URL includes HTTPS and the site base path.
