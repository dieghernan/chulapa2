# Development fixtures and browser tests

From the repository root, install the Ruby and Node.js dependencies and the
Chromium browser. This repository uses Ruby 3.4 and Node.js 24.

```sh
bundle install
npm ci
npx playwright install chromium
npm test
```

Playwright builds and serves the fixtures through `npm run preview:test` on a
free port, so a running preview or another checkout's test run does not
interfere. Set `CHULAPA2_TEST_PORT` to choose the port. To run just the skin
and Kitchen Sink tests, use
`npm test -- test/browser/skins.spec.mjs test/browser/kitchen-sink.spec.mjs`.

## Preview the fixtures

Run `npm run preview:test` to build drafts and unpublished fixtures in
`_site_test/` and preview them at port 4173, or at `CHULAPA2_TEST_PORT` when
set. The port is written into the fixtures' absolute URLs, so preview and
test runs in the same checkout rebuild `_site_test/`. Restart the preview
after changing sources or configuration.

| Preview | What to check |
| --- | --- |
| [Default Kitchen Sink](http://127.0.0.1:4173/chulapa2/) | Bootstrap defaults, component markup and Markdown. |
| [Auto Themer prototype](http://127.0.0.1:4173/chulapa2/test/auto-themer/) | Palette generation and link overrides. |
| [Dual-mode preview](http://127.0.0.1:4173/chulapa2/test/dual/) | Generated variants and selectors, including the [standalone Kitchen Sink](http://127.0.0.1:4173/chulapa2/test/dual/test/auto-themer/kitchen-sink/). |
| [GitDev preview](http://127.0.0.1:4173/chulapa2/test/gitdev/) | Authored colors, fonts, and components. |
| [Configured components](http://127.0.0.1:4173/chulapa2/test/tokens/test/auto-themer/components/) | Explicit fonts, CSS tokens, and light and dark overrides. |
| [Skin gallery](http://127.0.0.1:4173/chulapa2/test/skins/focal/) | Every bundled skin and its named or generated alternate. |
| [Base header with an image](http://127.0.0.1:4173/chulapa2/test/headers/base-image/) and [without an image](http://127.0.0.1:4173/chulapa2/test/headers/base/) | Legacy header front matter in the default and minimal layouts. |
| [Post header with an image](http://127.0.0.1:4173/chulapa2/test/headers/post-image/) and [without an image](http://127.0.0.1:4173/chulapa2/test/headers/post/) | Start-aligned title and divider aligned with the editorial column. |
| [Image header with a photo](http://127.0.0.1:4173/chulapa2/test/headers/image-photo/) and [without a photo](http://127.0.0.1:4173/chulapa2/test/headers/image/) | Centered photo at its original aspect ratio, with a viewport-relative height limit. |
| [Hero with a photo](http://127.0.0.1:4173/chulapa2/test/gitdev/test/headers/hero-photo/) and [without a photo](http://127.0.0.1:4173/chulapa2/test/gitdev/test/headers/hero/) | Overlay contrast, project links, and the active skin's surface in GitDev and GitDev Dark. |
| [Splash with a photo](http://127.0.0.1:4173/chulapa2/test/gitdev/test/headers/splash-photo/) and [without a photo](http://127.0.0.1:4173/chulapa2/test/gitdev/test/headers/splash/) | Full-screen hero with larger type and the same skin colors. |
| [Article header options](http://127.0.0.1:4173/chulapa2/test/article/full/) and [in Spanish](http://127.0.0.1:4173/chulapa2/test/article/es/) | Breadcrumb, translated dates, share links, page and site authors, and icon fallbacks. |

Use the [Unsplash Madrid collection](https://unsplash.com/es/colecciones/Cb6qszx7yKU/chulapa2)
or the [Pexels Madrid collection](https://www.pexels.com/es-es/collections/chulapa2-56djped/)
for new image fixtures when collection access is available.

The prototype reads its palette configuration from
[`test/_config.yml`](_config.yml). Use six-digit hex colors for
`vars.primary`. Dark mode shares the primary unless
`chulapa-skin-dark.vars.primary` supplies another color. With a separate
dark configuration, set its `autothemer` flag to generate that palette.
Link overrides apply to their own mode even when palette generation is off.

The published home page uses Auto Themer and Fira Code. The default test
preview starts from Bootstrap defaults so it can be compared with the
themed fixtures.

## Skin checks

Compare computed colors at mobile and desktop widths. The suite pins the
original primary colors and checks text, control boundaries and focus in
normal, hover, focus and active states. It also exercises the named and
generated variants, including system mode. Record original stock contrast
exceptions with measured ratios. Custom tokens and user content need their
own contrast review.

The regular GitHub Pages build publishes `_site/`. The preview output,
Playwright reports and this guide are excluded from that build.
