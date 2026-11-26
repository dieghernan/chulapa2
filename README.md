# chulapa2

An independent successor to chulapa, built with Jekyll 4 and Bootstrap 6.

## Develop locally

Install Ruby 3.4 and run these commands from the repository root.

```sh
bundle install
bundle exec jekyll serve
```

Open <http://127.0.0.1:4000/>. Jekyll rebuilds as you edit source files.
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
generate a matching dark palette from the same primary color.

To configure dark mode separately, add `chulapa-skin-dark`. That
configuration takes precedence over the matching dark palette and shows
the selector even when `color-mode-selector` is `false`. The first visit
uses the primary appearance.
Visitors can choose System to follow their device preference.
To generate a palette from the separate configuration, set its
`autothemer` flag to `true`. It uses its own `vars.primary` or the Bootstrap
default. To share a custom primary between both configurations, set the
same `vars.primary` in each.

The supported color values are quoted three- or six-digit hex colors.
An explicit `vars.primary` sets the primary color even when `autothemer`
is disabled. The flag controls generation of the related tones.
The Auto Themer falls back to Bootstrap's primary when it has no valid
configured primary. Explicit `vars.link-color` and `vars.link-hover-color`
apply in their own mode, even when generation is off. When only `link-color`
is set, the link keeps that color on hover.

## Deploy to GitHub Pages

Set the Pages publishing source to GitHub Actions. The
[deployment workflow](.github/workflows/deploy-pages.yml) uses the Pages
origin and base path for local asset URLs, runs Jekyll, and publishes
`_site/` from `main`. It also pushes a copy of the same build to the
`gh-pages` branch.

## Typeface

Chulapa is a typeface of the City Council of Madrid, designed and produced
by Joancarles Casasín and Pablo Gámez from an idea by Silvia Fernández
Palomar. The project includes Chulapa Bold under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
