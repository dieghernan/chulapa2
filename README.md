# chulapa2

An independent successor to chulapa, built with Jekyll 4 and Bootstrap 6.

## Develop locally

Install Ruby 3.4 and run these commands from the repository root.

```sh
bundle install
bundle exec jekyll serve
```

Open <http://localhost:4000/chulapa2/>. Jekyll rebuilds as you edit source files.
Run `bundle exec jekyll build` to generate the site in `_site/`.
To include drafts in the local preview, run
`bundle exec jekyll serve --drafts --destination _site_test`.

The browser loads the pinned Bootstrap 6 CSS and JavaScript from jsDelivr.
Viewing the Bootstrap styles and interactive components requires access to
the CDN.

## Run the browser tests

Install Node.js 24 for the Playwright tests.

```sh
npm ci
npx playwright install chromium
npm test
```

Run `npm run preview:test` to preview Jekyll drafts and unpublished fixtures.
This build uses `_site_test/` and serves
<http://127.0.0.1:4173/chulapa2/>. The Auto Themer prototype is under
<http://127.0.0.1:4173/chulapa2/test/auto-themer/>.
The prototype reads the primary color and link overrides from
[`test/_config.yml`](test/_config.yml). Use a six-digit hex color for
`vars.primary`. Dark mode shares the primary color unless
`chulapa-skin-dark.vars.primary` supplies another one. Without a dark
configuration, dark mode follows the light Auto Themer setting. When a dark
configuration is present, set its `autothemer` flag to `true` to generate
that palette. Link overrides belong to their own mode and also apply when
palette generation is off. Restart the preview after editing the file.
The GitHub Pages workflow publishes only `_site/` from the regular build.
Keep drafts that need to stay private out of the public Git repository.

The home page includes a Bootstrap 6 kitchen sink. Compare the
[default preview](http://127.0.0.1:4173/chulapa2/) with the
[Auto Themer preview](http://127.0.0.1:4173/chulapa2/test/dual/) and the
[GitDev preview](http://127.0.0.1:4173/chulapa2/test/gitdev/).
The [standalone kitchen sink](http://127.0.0.1:4173/chulapa2/test/dual/test/auto-themer/kitchen-sink/)
shows the same content, form and component families on their own page.
The gallery covers the Bootstrap 6 component index and uses the chulapa2
site header. Drawer, Nav overflow and Toggler have separate examples.

## Generate a primary palette

Enable the Auto Themer in `_config.yml` and set a primary color.

```yaml
chulapa-skin:
  autothemer: true
  vars:
    primary: "#285d70"
```

By default the site uses the primary configuration and hides the color mode
selector. Set the top-level `color-mode-selector: true` to offer the
Bootstrap color modes. Set `use-dual-mode: true` within `chulapa-skin` to
use its bundled dark variant when available. The Auto Themer generates a
dark palette from the same primary color when the skin has no dark variant.
The automatic variant shares `vars` except the body foreground and background.

To configure dark mode separately, add `chulapa-skin-dark`. That
configuration takes precedence over the matching dark palette and shows
the selector even when `color-mode-selector` is `false`. The first visit
uses the primary appearance.
Visitors can choose System to follow their device preference.
To generate a palette from the separate configuration, set its
`autothemer` flag to `true`. It uses its own `vars.primary` or the Bootstrap
default. To share a custom primary between both configurations, set the
same `vars.primary` in each. See the
[supported skin settings](docs/theming.md#skin-settings).

Use native CSS values in `vars`, including quoted hex colors, font stacks,
dimensions and CSS functions. A Bootstrap token such as `primary-base`
can be written with or without the `--bs-` prefix. Explicit values apply
with or without generation. Auto Themer uses Bootstrap's primary when
the configuration supplies no primary. It derives neutral surfaces and
status colors from the primary, while named skins and explicit tokens
take precedence. Existing `skin: auto` configurations also enable generation. See the
[theming architecture](docs/theming.md) for precedence, inheritance,
component-level overrides and migration aliases.

## Load fonts

Declare Google Fonts stylesheet URLs in the top-level `googlefonts` list.
Use the family tokens under `vars` to apply the loaded fonts.

```yaml
googlefonts:
  - url: "https://fonts.googleapis.com/css2?family=Raleway&family=Rubik&display=swap"

chulapa-skin:
  vars:
    body-font-family: "Rubik, sans-serif"
    heading-font-family: "Raleway, sans-serif"
```

The legacy `font-family-base` and `headings-font-family` names also work.
Each mode can select its own font families from the loaded stylesheets.
Run `npm run preview:test` and open
<http://127.0.0.1:4173/chulapa2/test/tokens/test/auto-themer/components/>
to see both modes with configured fonts, colors and component tokens.

## Choose a bundled skin

The initial collection includes GitDev and GitDev Dark. Use the same
skin names as in chulapa.

```yaml
chulapa-skin:
  skin: gitdev
chulapa-skin-dark:
  skin: gitdev-dark
```

An explicit `chulapa-skin-dark` takes priority over the dark variant. Use
`chulapa-skin.use-dual-mode: true` and `color-mode-selector: true` to offer
GitDev Dark as the dark variant of GitDev without a separate dark block.
GitDev and GitDev Dark use their original palette, Inter for text,
Inter Tight for headings and navigation, and Roboto Mono for code.
Explicit primary and link colors in `vars` take precedence over skin defaults.

## Choose code highlighting

Jekyll uses Kramdown and Rouge to highlight fenced Markdown code blocks.
Choose the stylesheet with the same `highlight` key as in chulapa.

```yaml
chulapa-skin:
  skin: gitdev
  highlight: github
chulapa-skin-dark:
  skin: gitdev-dark
  highlight: github.dark
```

The supported values are `default`, `github` and `github.dark`. The main
mode uses `default` for omitted or unsupported values. The dark mode
inherits the main highlighter when its value is omitted or unsupported.
The kitchen sink includes a fenced Ruby example to compare the palettes.

## Add a callout

Use `callout-note`, `callout-tip`, `callout-important`, `callout-warning`
or `callout-caution` with a Kramdown attribute list, as in chulapa.

```markdown
Review the preview before publishing.
{: .callout-tip role="note" aria-label="Tip"}
```

For multiple blocks, use a `div` with the callout class and
`markdown="1"`. The visible title follows the page language for English
and Spanish. Set the accessible label in the language of your content.

## Deploy to GitHub Pages

Set the Pages publishing source to GitHub Actions. In `_config.yml`, set
`url` to the public origin, such as `https://example.com`, and `baseurl` to
the site's path, such as `/chulapa2` for this repository. The
[deployment workflow](.github/workflows/build-chulapa-gh-pages.yml) builds
with Jekyll using the configured Pages base path and publishes
`_site/` from `main`. It also pushes a copy of the same build to the
`gh-pages` branch.

## Typeface

Chulapa is a typeface of the City Council of Madrid, designed and produced
by Joancarles Casasín and Pablo Gámez from an idea by Silvia Fernández
Palomar. The project includes Chulapa Bold under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
