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

## Migrate from chulapa

See the [migration draft](development/migrating-from-chulapa.md) for the
settings that keep working and the HTML and CSS changes a chulapa site needs.

## Run the browser tests

See the [test guide](test/README.md) for the test suite, drafts, and themed
previews. Keep private drafts out of the public Git repository.

## Generate a primary palette

Enable the Auto Themer in `_config.yml` and set a primary color.

```yaml
chulapa-skin:
  autothemer: true
  vars:
    primary: "#285d70"
```

By default the site uses the primary configuration and hides the color mode
selector. Set `use-dual-mode: true` within `chulapa-skin` to offer an
alternate appearance with the selector. It uses the skin's bundled variant
when available. Without one, the variant follows the primary
configuration's `autothemer` setting: the Auto Themer generates it from the
same primary, or Bootstrap's own mode applies when generation is off. The
automatic variant shares `vars` except the body foreground and background.

To configure dark mode separately, add `chulapa-skin-dark`. That
configuration takes precedence over the matching dark palette and also
shows the selector. The first visit uses the primary appearance.
Visitors can choose System to follow their device preference.
To generate a palette from the separate configuration, set its
`autothemer` flag to `true`. It uses its own `vars.primary` or the Bootstrap
default. To share a custom primary between both configurations, set the
same `vars.primary` in each. See the
[supported skin settings](development/theming.md#skin-settings).

Use native CSS values in `vars`, including quoted hex colors, font stacks,
dimensions and CSS functions. A Bootstrap token such as `primary-base`
can be written with or without the `--bs-` prefix. Explicit values apply
with or without generation. Auto Themer uses Bootstrap's primary when
the configuration supplies no primary. It derives neutral surfaces and
status colors from the primary, while named skins and explicit tokens
take precedence. Existing `skin: auto` configurations also enable generation. See the
[theming architecture](development/theming.md) for precedence, inheritance,
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
See the [configured components preview](test/README.md#preview-the-fixtures) for an example in both modes.

## Page layouts and navigation

Use `layout: default` for a page with a content container and title.
Use `layout: minimal` when the page supplies its own content layout.
Both layouts share the page head, site navigation and footer.

```yaml
navbar:
  expand: md
  brand:
    title: My site
    img: /assets/img/logo.png
    url: /
  nav:
    - title: Home
      url: /
    - title: Resources
      child:
        - title: About
          url: /about/

footer:
  links:
    - label: Contact
      url: hello@example.com
  copyright: "&copy; My site"
```

`navbar.expand` accepts `sm`, `md`, `lg`, `xl`, `always` and `never`.
At the selected breakpoint, Bootstrap 6 switches between the side drawer
and inline navigation according to the navbar's width. The default is `md`.
The mobile drawer uses the same title as the navbar brand. Brand, link and
submenu labels support inline HTML, such as `<span class="chulapa">chulapa2</span>`
for the wordmark. Keep the site `title` in plain text for the browser tab and
metadata.
The brand uses the site title and home URL when its settings are omitted.

## Choose a bundled skin

Use the original Chulapa names for the 16 maintainer-authored and 12 TopHat
skins. See the [skin catalog and contrast checks](development/theming.md#bundled-skins).

```yaml
chulapa-skin:
  skin: gitdev
chulapa-skin-dark:
  skin: gitdev-dark
```

An explicit `chulapa-skin-dark` takes priority over the dark variant. Use
`chulapa-skin.use-dual-mode: true` to offer
GitDev Dark as the dark variant of GitDev without a separate dark block.
For light skins without a bundled dark variant, such as Focal and Media,
`use-dual-mode: true` generates dark surfaces and keeps the skin's palette
and typography. Dark skins use their bundled light counterpart. Listen
gets a generated light variant.
Explicit primary and link colors in `vars` take precedence over skin defaults.
See the [skin gallery](test/README.md#preview-the-fixtures) to compare skins and color modes.

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

## Photo credits

Plaza Mayor, Madrid. Photo by [Juan Gomez](https://unsplash.com/es/@nosoylasonia?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/es/fotos/edificio-de-hormigon-rojo-y-beige-XO3v5IAeAR4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText).

Mercado de San Miguel, Madrid. Photo by [Bas van der Linden](https://unsplash.com/es/@basvdlinden98?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/es/fotos/un-grupo-de-personas-sentadas-en-las-mesas-de-un-restaurante-m9GyQa8Ylmo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText).
