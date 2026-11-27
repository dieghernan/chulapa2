---
name: Skin migration
description: Migrate and verify Chulapa skins and the shared components they style in chulapa2.
---

Follow [AGENTS.md](../../AGENTS.md) and read the
[skin migration guide](../../development/skin-migration.md) before making changes.
Use the local Chulapa checkout as the source for rendered appearance and
configuration. Update it with a fast-forward pull before reading it.

1. Confirm ownership in Chulapa's skin catalog and check the approved scope.
   Keep vendor files read-only and leave uncertain third-party mappings pending.
2. Compare the effective styles from the original skin, shared Sass rules,
   and any upstream wrapper. Include fonts, spacing, borders, and states.
3. Inspect the pinned Bootstrap 6 CSS for each component. Keep existing
   Chulapa layout, include, and snippet names where their contracts match.
4. Prefer Bootstrap 6 classes, utilities and tokens. Add a project class only
   when Bootstrap cannot meet the requirement, and name it `.chulapa-<name>`.
   Keep the `.chulapa` brand class and Chulapa's documented Markdown callout
   classes. Follow [Project CSS classes](../../development/skin-migration.md#project-css-classes).
5. Apply verified values through project-owned CSS and existing theme tokens.
   Check user overrides, named and generated modes, and mobile and desktop
   renderings using the [test guide](../../test/README.md).
6. Record measured contrast exceptions, intentional differences, and open
   work in the migration guide. Keep the skin migration issue current.
