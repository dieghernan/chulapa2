---
published: false
---

# Migrate a site from chulapa

This draft lists the changes that an existing chulapa site needs in
chulapa2. It covers only implemented features. chulapa2 is pre-release, so
the theme reference and the official guide come later.

## What keeps working

These settings and front matter keys behave as in chulapa:

- `chulapa-skin` and `chulapa-skin-dark`, including the original skin
  names, `skin: auto`, `autothemer`, `highlight` and `vars`.
- The legacy `vars` names `font-family-base`, `headings-font-family`,
  `hero-chulapa-bg-color` and `hero-chulapa-text-color`.
- `googlefonts`, `navbar` and `footer`.
- The `default` and `minimal` layouts.
- The `base`, `post`, `image`, `hero` and `splash` values of `header_type`, with
  `title`, `subtitle`, `header_img`, `header_img_alt` and `project_links`.
- The Kramdown callout classes, such as `{: .callout-note}`.
- The article options `show_date`, `show_sociallinks`, `show_author`,
  `show_breadcrumb` and `breadcrumb_list`, the page `author` mapping and
  the `snippets/datetranslate.html` include.

See the [README](../README.md) for each setting and the
[theming reference](theming.md#skin-settings) for skin options.

## Build with GitHub Actions

chulapa2 needs Jekyll 4 and does not build in the legacy GitHub Pages
environment. Set the Pages publishing source to GitHub Actions. Set `url`
to the public origin and `baseurl` to the site's path in `_config.yml`.
See [Deploy to GitHub Pages](../README.md#deploy-to-github-pages).

## Update custom HTML

chulapa2 uses Bootstrap 6. Markup written for Bootstrap 4 in your pages or
includes needs the Bootstrap 6 equivalents. Apply the
[Bootstrap 5 migration guide](https://getbootstrap.com/docs/5.3/migration/)
first, then the [Bootstrap 6 migration guide](https://getbootstrap.com/docs/6.0/guides/migration/).
Common changes in chulapa content:

| Bootstrap 4 | Bootstrap 6 |
| --- | --- |
| `.lead` | `.fs-lg` |
| `.display-1` to `.display-4` | `.fs-*` and `.fw-*` utilities |
| `.btn-primary` | `.btn-solid .theme-primary` |
| `.btn-outline-primary` | `.btn-outline .theme-primary` |
| `.text-primary`, `.text-muted` | `.fg-primary`, `.fg-secondary` |
| `.col-md-6`, `.d-lg-none` | `.md:col-6`, `.lg:d-none` |

Spacing utilities also changed scale. For example, `.p-3` was 1rem and is
now 0.5rem; use `.p-5` for 1rem.

### Alerts in Markdown

chulapa documented alerts written with Bootstrap 4 classes in a Kramdown
attribute list. Bootstrap 6 has no `.alert-info` or `.alert-warning`, so
these alerts lose their color. Replace the color class with a theme class
and update the spacing:

```markdown
<!-- chulapa -->
{: .alert .alert-info .p-3 .mx-2 .mb-3}

<!-- chulapa2 -->
{: .alert .theme-info .p-5 .mx-3 .mb-5}
```

Use `.theme-warning` in place of `.alert-warning`. The callout classes,
such as `.callout-note`, need no changes and add a localized title.

## Update custom CSS

chulapa2 names its own classes `.chulapa-<name>`. These chulapa classes
are renamed:

| chulapa | chulapa2 |
| --- | --- |
| `.navbar-chulapa` | `.chulapa-navbar` |
| `.footer-chulapa` | `.chulapa-footer` |
| `.header-chulapa` | `.chulapa-header` |
| `.header-chulapa-img` | `.chulapa-header-banner` |
| `.hero-chulapa` | `.chulapa-hero` |
| `.hero-chulapa-image` | `.chulapa-hero-photo` |
| `.splash-chulapa` | `.chulapa-hero.chulapa-splash` |
| `.splash-chulapa-image` | `.chulapa-splash.chulapa-hero-photo` |

Page subtitles use `.chulapa-subtitle`, as in chulapa, without `.lead`.
Skins and colors are CSS custom properties instead of Sass variables.
Set them through `vars` or the custom properties in the
[theming reference](theming.md).

## Not available yet

- The other chulapa layouts, such as `archive`, `landingpage` and `search`.
- Font Awesome, which becomes opt-in. Until then, an `icon` in
  `project_links`, `author.links` or `footer.links` renders as its
  label, or nothing on a button that already shows one. Use a Bootstrap
  Icons class such as `bi bi-github` to show an icon now. The page source marks each missing
  icon with a comment and a `data-chulapa-missing-icon` attribute.
- Microformats2 and Schema.org markup in the article header, which the
  metadata audit will decide.
- The legacy `navbar-chulapa-*` options in `vars`.
- Installing chulapa2 as a theme.

Track progress in the [roadmap](https://github.com/dieghernan/chulapa2/issues/3).
