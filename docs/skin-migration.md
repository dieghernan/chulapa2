---
published: false
---

# Migrating skins from Chulapa

Use this guide when adapting a Chulapa skin to chulapa2. It records
component differences and compatibility work still pending. Check the
[theming reference](theming.md) for the Bootstrap version and token precedence.
Follow the [skin migration issue](https://github.com/dieghernan/chulapa2/issues/10)
for the checklist by skin family.

## Start with the original skin

1. Check the skin's author in Chulapa's skin catalog. For third-party skins,
   keep vendored files read-only and preserve the original values when mapping
   verified variables and component rules. Leave uncertain mappings pending.
2. Record the effective palette, fonts, spacing, borders and component styles.
   Check both the upstream skin and the Chulapa wrapper, since the wrapper can
   override the upstream design.
3. Find the consumer of each value in the pinned Bootstrap CSS. A theme class
   can affect a different part of a component than its Bootstrap 4 counterpart.
4. Use the skin selector in the Kitchen Sink to inspect both modes. Run
   `npm test -- test/browser/skins.spec.mjs test/browser/kitchen-sink.spec.mjs`
   to verify rendered colors, contrast and behavior.

## Contrast rules for maintainer-authored skins

Look for an import of `chulapa/skins/authored-contrast` in the original skin.
Chulapa's shared stylesheet runs its defaults before the component styles
and applies the contrast overrides after them. Inspect the compiled skin
alongside the Sass variables to recover the effective styles.
[Authored contrast rules][legacy-authored-contrast] · [Chulapa stylesheet][legacy-stylesheet]

| Area | What the original rules add |
| --- | --- |
| Navbar and footer | Derive link, hover and active colors from each background. The navbar brand uses the active contrast color. Readability adjustments use 4.6:1 by default. |
| Callouts | For variants selected by the skin, adjust the accent border against the tinted callout surface to at least 3.05:1. |
| Series index | If enabled by the skin, adjust link and hover/focus colors against the tinted series index surface. |
| Badges, filled cards and outline buttons | Apply the extra rules only when the effective palette still matches the original stock values. Check badge hover and focus, links inside filled cards, and outline button states. |

All 16 skins credited to dieghernan in Chulapa import the partial.
Academia, Butterfly, Chulapa, Focal, GitDev Dark, Media, Navi, Pear, Towards
and Twitter opt into callout border adjustments. Butterfly Dim and Twitter
opt into series index contrast. The current pass covers navbars. The other
components still need their own migration checks.

## Navbar

In Chulapa, `navbar-chulapa-bg-color` defaults to the primary color.
`navbar-chulapa-text-color` controls links and
`navbar-chulapa-brand-color` controls the brand. The original stylesheet
derives these colors and the interaction states from the background unless
the skin or configuration supplies values. The footer and hero also default
to the navbar background. [Chulapa variable dictionary][legacy-vars]

In chulapa2, the TopHat adapter uses the primary base color for the main
variant's navbar background and the primary contrast token for the foreground.
The generated alternate uses its body surface and foreground for the navbar.
The shared rules apply to `.chulapa-navbar`, which both the site header and the
Kitchen Sink example use.

Compare the background, brand, link, hover, active and disabled colors in
Chulapa's compiled CSS. Include the mobile drawer in the visual check.
Chulapa and Pear derive their navbar from the primary base, Navi uses the
secondary base, and Focal uses its own dark background. Keep skin-specific
backgrounds before adapting the colors of generated variants. In the browser
tests, pin the original variant's background and brand for every bundled skin
and check link contrast in the themed fixtures.

Wandoo illustrates the difference in text contrast. The original background
is `#FF304F`, and Chulapa's contrast function can select white because its
default threshold is 3:1. White on that pink measures 3.63:1. Chulapa2 uses
black on the same background for readable normal-size text.
[Chulapa contrast function][legacy-contrast]

Keep the TopHat palette values and explicit wrapper assignments. Restore
derived link colors only when they meet the contrast target on the original
background. For example, Electro's normal link mix is below 4.5:1 while its
hover mix is readable. The existing Mickie and Skeeblu exceptions document
stock foregrounds that remain below the threshold.

Towards also inherits the primary background in Chulapa. Its wrapper derives
separate colors for the brand, links and interaction states. The chulapa2
adapter keeps the original blue background, white brand and lighter blue link
colors in the main variant. Check the shared defaults as well as explicit
assignments when migrating a skin. [Towards preview in Chulapa][legacy-towards]

**Pending.** Map the supported legacy `navbar-chulapa-*` YAML names to the
corresponding chulapa2 settings and verify that explicit values override the
skin defaults. Check the original derived colors again when users customize
the backgrounds of maintainer-authored skins.

## Cards and breadcrumbs

- Bootstrap 4 uses `.card.bg-primary` for an explicitly filled card. In
  the pinned Bootstrap 6 alpha, `.card.theme-primary` themes the border and
  can color the header and footer while the card keeps its default
  `--bs-card-bg`. The body reads `--bs-card-color`, which defaults to
  `inherit`. Keep TopHat's legacy text overrides on explicit `.bg-*` cards.
  Apply the same distinction to secondary cards. [Bootstrap 4 cards][bs4-cards]
  · [Pinned Bootstrap CSS][bootstrap-dist]
- Bootstrap 6 puts `aria-current="page"` on the current
  `.breadcrumb-item`; `.breadcrumb-link.active` goes on the inner
  element. Test both elements so the check matches the accessible markup.
  [Bootstrap 6 breadcrumbs][bs6-breadcrumbs]

[legacy-vars]: https://dieghernan.github.io/chulapa/docs/variable-dictionary
[legacy-contrast]: https://github.com/dieghernan/chulapa/blob/main/_sass/chulapa/_bootstrapv5.scss#L18
[legacy-authored-contrast]: https://github.com/dieghernan/chulapa/blob/main/_sass/chulapa/skins/_authored-contrast.scss
[legacy-stylesheet]: https://github.com/dieghernan/chulapa/blob/main/_sass/chulapa-master.scss
[legacy-towards]: https://dieghernan.github.io/chulapa/skins/towards
[bs4-cards]: https://getbootstrap.com/docs/4.6/components/card/#background-and-color
[bootstrap-dist]: https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.2/dist/css/bootstrap.css
[bs6-breadcrumbs]: https://getbootstrap.com/docs/6.0/components/breadcrumb/#accessibility
