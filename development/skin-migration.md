---
published: false
---

# Migrating skins from Chulapa

Use this guide when adapting a Chulapa skin to chulapa2. It records
component differences and compatibility work still pending. Check the
[theming reference](theming.md) for the Bootstrap version and token precedence.
Follow the [skin migration issue](https://github.com/dieghernan/chulapa2/issues/10)
for the checklist by skin family.

Use the [migration agent](../.github/agents/skin-migration.agent.md) for the
workflow and the [test guide](../test/README.md) for verification.

## Layouts, includes, and assets

`default` inherits from `minimal`. The shared `head.html`, `navbar.html`,
and `footer.html` includes use Chulapa's original entry-point names.
`components/` holds the markup and script includes. `snippets/` keeps the
original paths for page language, explicit dark-skin detection, and the
Bootstrap demo. The demo uses the current Bootstrap 6 component set.
The stylesheet is published at Chulapa's `assets/css/highlighter.css` path.
The original HTML compression layout remains a separate migration decision.

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

Chulapa's classic dropdowns share the navbar's background and link colors.
In chulapa2, map those values to `--bs-menu-bg` and `--bs-menu-color`
on menus inside `.chulapa-navbar`. Map the hover, focus, active and disabled
item tokens to the corresponding navbar states. Use the skin's hover
background when provided and keep the navbar background otherwise. Active
items use a heavier weight, hovered items are underlined, and keyboard focus
has an outline. Check both link submenus and the theme selector on desktop
and inside the mobile drawer. Verify normal-size text at 4.5:1 and visible
keyboard focus at 3:1 against the menu surface.
[Chulapa dropdown rules][legacy-navbar] · [Pinned Bootstrap CSS][bootstrap-dist]

The menus inherit the existing TopHat text contrast exceptions from the
navbar. Mickie's text measures 2.95:1 in normal, hover, focus and active
states. Skeeblu's normal text measures 2.38:1.

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

## Body links

Bootstrap 4 sets `$link-color` to the primary. Academia, Butterfly Dark,
Listen, Towards and Twitter Lights Out leave it unset, so their links use
the original primary color in chulapa2 as well. Each pair already
measures at least 5.7:1 on its page background. Generated variants still
derive their link colors from the generated surface.

## Footer and attribution

Chulapa's footer centers its links, copyright and theme attribution.
Chulapa2 retains that order. The footer defaults to the navbar background
and derives text, link and hover colors from its own surface. CSS
`color-mix()` reproduces the original blend weights for most skins.
Electro, Hootstrap, Lymcha, Preptor and Wandoo use stronger foreground
blends to reach 4.5:1 on their original backgrounds.

GitDev and Media keep their original footer surfaces. Butterfly Dark,
Butterfly Dim, GitDev, Listen, Media and the Twitter variants retain their
explicit text and link colors. Skeeblu also retains its original explicit
colors, with measured exceptions of 2.38:1 for text, 1.30:1 for the link
and 1.22:1 for its hover, focus and active text. The focus outline uses the
surface contrast independently. Named variants use their own footer
palette. Generated variants derive it from their generated body surface.

Custom CSS can set `--chulapa-footer-bg`, `--chulapa-footer-color`,
`--chulapa-footer-link-color` and `--chulapa-footer-link-hover-color`.
Both layouts link to the Chulapa2 project in the attribution. The attribution
uses 80% of the base text size, as in Chulapa. Use the public `.chulapa` class
to apply the Chulapa typeface and its ligatures to selected text, including
when the skin disables ligatures on body copy.

Footer links use visible text in Chulapa2. Email links open a new message
without a preset subject. The original Font Awesome icon stacks, comment
providers and the automatic top border when the footer matches the body
still need migration.
[Original footer markup][legacy-footer]

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
[legacy-navbar]: https://github.com/dieghernan/chulapa/blob/main/_sass/chulapa/_classes.scss#L278-L301
[legacy-footer]: https://github.com/dieghernan/chulapa/blob/main/_includes/components/footer-content.html
[bs4-cards]: https://getbootstrap.com/docs/4.6/components/card/#background-and-color
[bootstrap-dist]: https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.2/dist/css/bootstrap.css
[bs6-breadcrumbs]: https://getbootstrap.com/docs/6.0/components/breadcrumb/#accessibility
