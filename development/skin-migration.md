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

The `base` page header keeps Chulapa's centered title and optional banner
cropped to 20% of the viewport height. The banner is an image element with
`object-fit: cover`. Set `header_img_alt` for a meaningful image and leave
it empty for decoration. The title uses Bootstrap's fluid `fs-4xl` size
and keeps Chulapa's 1.5rem space above it. Project buttons wrap when space
is limited.

The `post` page header shares the banner and title styles with `base`.
It aligns titles, subtitles and project buttons to the start of the reading
column. The `default` layout centers this column at eight Bootstrap grid
columns from `lg` and uses the full container width below that breakpoint.
The home page kitchen sink uses `minimal` and keeps the full container width.

The article options in `default` keep Chulapa's placement. The breadcrumb
and dates sit above the reading column, and the share links sit at its right
edge. The author card sits to the left from `lg` and above the article on
smaller screens. The breadcrumb uses Bootstrap 6's native component, so its
links have the component's padding, colors and divider instead of Chulapa's
inline links. Dates keep Chulapa's lower-case format, and `<s>` marks the
publication date when `last_modified_at` is set. Share and author icons use
Bootstrap Icons, without Chulapa's square brand variants. The author avatar
uses Bootstrap's `avatar-xl` (4rem) instead of Chulapa's `8vmax`, and
`.chulapa-author` keeps its links in the text color until hovered.

The `image` header centers the uncropped image above the title and keeps its
intrinsic aspect ratio. Bootstrap 6's `lg` breakpoint switches the maximum
image height from 30% to 25% of the viewport. Chulapa interpolated the
height across the medium-to-large range. With no photo, the centered title
and divider remain aligned with the editorial column.

The `hero` header has a 40vh minimum height, centered text, a short divider
and project links in a Bootstrap `.btn-group-vertical`, as in Chulapa.
Bootstrap 6's `btn-lg` keeps the body font size, so the links are smaller
than Chulapa's 1.25rem desktop buttons. Header sizes use Bootstrap 6 fluid
font utilities: base titles use `fs-4xl` and the hero uses `fs-5xl`, with
`fs-lg` and `fs-2xl` subtitles. Chulapa's 3.5rem and 4.5rem titles become
3rem and 4rem at desktop widths, keeping their hierarchy. On a 390px screen,
the hero title is about 51px instead of Chulapa's 40px and the subtitle 28px
instead of 24px; base titles stay close at about 38px. A fixed
`heading-line-height` in `vars` can make large titles overlap. Titles use the
skin's heading weight instead of Chulapa's light weight, which came from
Bootstrap 4 display headings. Subtitles use the body weight for the same
reason. Focal keeps its Fira Sans title at 600, the treatment it applies to
display text. Base and post project links use `btn-solid theme-primary`.
See [Project CSS classes](#project-css-classes) for the renamed header
classes.

The photo keeps the cover crop and Chulapa's subtle shadow behind the text
and divider. The shadow is black in every skin; Chulapa tinted it with each
skin's `$black`, which is visually equivalent. The stronger overlay keeps
white text readable over bright images. Hovering a project button over a
photo inverts white and the overlay color, matching the hero without a
photo, instead of using each skin's dark and light grays. The image element
exposes `header_img_alt` when set.

The `splash` header is the hero with `.chulapa-splash`. As in Chulapa, it
fills the screen and places the project links 3rem below the subtitle.
It uses `100svh` so mobile browser bars do not hide its lower edge. The
title uses `fs-6xl` and the subtitle `fs-3xl`. Chulapa's 6rem title becomes
5rem at desktop widths and about 64px instead of 48px on a 390px screen;
the 2.5rem subtitle is unchanged at desktop widths.

Without a photo, the hero defaults to the navbar surface and computes its
own contrasting foreground. Academia derives its original darker blue from
the primary color and Twitter uses its primary blue. Chulapa, Listen,
Media and Twitter Lights Out keep their original foregrounds. Twitter,
Hootstrap, Mickie and Wandoo pin black text on their original surfaces.
Chulapa used white, which measured about 3.0:1 to 4.4:1 on those colors.
Skeeblu retains its explicit TopHat foreground at 2.38:1 against the
original blue, a known exception for its text and control boundaries.
Generated alternate skins derive their hero from their own navbar surface.

In `chulapa-skin.vars`, `hero-chulapa-bg-color` and `hero-chulapa-text-color`
map to `--chulapa-hero-bg` and `--chulapa-hero-color`. An explicit custom
property takes precedence over its alias. The same foreground styles the
title, subtitle, divider, and outline buttons. Hovering a project button
inverts the two colors.

## Project CSS classes

Style components with Bootstrap 6 classes, utilities and tokens first. Add a
project class only for a requirement Bootstrap cannot meet, such as a skin
color or a viewport-relative height, or as a public hook. Name it
`.chulapa-<name>`. The `.chulapa` brand class is the exception.

Chulapa's Kramdown callout classes, such as `.callout-note`, keep their
names. The public Chulapa documentation told authors to write them in
Markdown, so renaming them would break existing content. Classes generated
by third-party tools, such as Rouge's `.highlight`, also keep their names.

Chulapa classes that placed the prefix last are renamed. Record each rename
in the [site migration guide](migrating-from-chulapa.md#update-custom-css).
YAML options such as `hero-chulapa-bg-color` and `navbar-chulapa-bg-color`
are configuration, not classes, and keep their names.

## Unsupported Chulapa skins

chulapa2 bundles the 16 skins by dieghernan and the 12 TopHat skins. A
`skin` name outside the catalog adds no skin declarations, and the
generated `auto-themer.css` starts with a comment naming it. Rebuild these
Chulapa skins from their palette with the Auto Themer:

```yaml
chulapa-skin:
  skin: auto
  vars:
    primary-base: "#2c3e50"   # Flatly
```

| Chulapa skin | `primary-base` | Also set |
| --- | --- | --- |
| `cerulean` | `#2fa4e7` | |
| `cyborg` | `#2a9fd6` | `bg-body: "#060606"` |
| `darkly` | `#375a7f` | `bg-body: "#222"` |
| `flatly` | `#2c3e50` | |
| `journal` | `#eb6864` | |
| `litera` | `#4582ec` | |
| `lux` | `#1a1a1a` | |
| `materia` | `#2196f3` | |
| `minty` | `#78c2ad` | |
| `pulse` | `#593196` | |
| `sketchy` | `#333` | |
| `slate` | `#3a3f44` | `bg-body: "#272b30"` |
| `solar` | `#b58900` | `bg-body: "#002b36"` |
| `united` | `#e95420` | |
| `universal` | `#986dbd` | |
| `yeti` | `#008cba` | |

The primaries come from the Bootswatch 4.6 variables and the Bootstrapious
wrapper bundled with Chulapa. Dark themes also need a readable `fg-body`
for their background. Bootswatch's typography and component styles are
not reproduced. For `none`, omit `skin`. For `dark-bg`, set
`bg-body: "#000"`, `fg-body: "#fff"` and `code-color: "#e9468e"`.

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

The brand keeps Chulapa's bold 1.25rem with Bootstrap's `fs-lg` and
`fw-bold` utilities, and the active link and the menu toggle that contains
the current page are bold. Links use the body font and weight unless the
skin changes them: GitDev and Focal keep their heavier navigation and Media
uses its heading font, as in Chulapa. The Chulapa skin keeps its body font in
the navbar; only headings, buttons and the footer use the Chulapa typeface.
Pear scaled its brand to its 1.125rem body size in Chulapa; chulapa2 uses
the shared 1.25rem.

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
measures at least 5.7:1 on its page background.

Generated variants keep each role's OKLCH hue and chroma, capped at 0.14,
for role foregrounds, body links and the navbar's hover and active links.
Only the lightness changes: at most 0.42 on a light surface and at least
0.78 on a dark one, as in the Auto Themer. Hover uses 0.34 and 0.86,
since Bootstrap underlines links in every state. Listen's light variant uses green and
Academia's dark variant uses blue. Skins with a gray primary keep gray
links. Academia's original navbar accent is its secondary color, and the
variant uses the closely matching primary instead.

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
