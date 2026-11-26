# chulapa2 — Project instructions

## 1. Project identity

- Project name: **chulapa2**.
- Reference project: https://github.com/dieghernan/chulapa
- Local path: `cd ../chulapa`. Needs `git pull ` before accessing.
- chulapa2 is an independent successor to chulapa.
- Preserve the original [Chulapa typeface](https://dieghernan.github.io/chulapa/docs/53-chulapa-font) and its distinctive visual identity as the project's branding.
- English is the official project language. All code comments, documentation, commit messages, issues and public communications should be written in English.
- chulapa will remain a separate project in maintenance mode, receiving bug fixes and security updates.

## 2. Project vision

chulapa2 is a clean-slate reconstruction of chulapa using Bootstrap 6.

The primary objective is to eliminate accumulated technical debt while preserving the visual identity, core functionality and user experience of chulapa.

This is not a port, a fork or an incremental migration of the existing codebase.

Use chulapa as a visual and functional reference, not as an implementation template.

Reconstruct features using modern technologies and native Bootstrap 6 capabilities rather than translating legacy implementations.

## 3. Technical foundation

- [Bootstrap 6](https://getbootstrap.com/docs/6.0/getting-started/install/).
- Jekyll 4 or a later suitable stable version.
- Dart Sass, where Sass compilation is required.
- Modern CSS and native browser capabilities.
- Vanilla JavaScript.
- GitHub Actions for building, testing and deployment.
- Prioritize Bootstrap Icons <https://icons.getbootstrap.com/> on the layouts.

Do not introduce dependencies solely to reproduce legacy implementation details.

Do not require compatibility with LibSass, Bootstrap 4, jQuery or the legacy GitHub Pages build environment.

Until Bootstrap 6 reaches a stable release, treat its APIs and implementation details as potentially subject to change.

## 4. Development philosophy

### Bootstrap-first

Use native Bootstrap 6 classes, components, utilities, design tokens and color modes wherever possible.

Check examples against the Bootstrap 6 version used by chulapa2. Use Bootstrap
4 and 5 references only to understand legacy chulapa behavior or document how
to migrate existing sites to Bootstrap 6.

Before implementing custom functionality, determine whether Bootstrap 6 already provides an appropriate solution.

Custom CSS, Sass and JavaScript must address a concrete requirement that cannot reasonably be fulfilled using native functionality.

### Vendor dependencies and skins

- Treat `vendor` and other vendored third-party files as read-only. Put
  chulapa2 customizations in project-owned files.
- Preserve Bootstrap 6's baseline appearance in every skin. Keep its component
  styling, including buttons, typography, spacing, borders, and corner radii.
  Apply skin colors through Bootstrap 6's theming APIs.
- Obtain explicit user approval before creating or modifying a skin, including
  changes to shared styles or tokens that change a skin's appearance.
- Changes scoped to chulapa2's own components require no skin approval. Keep
  those styles within the component so they leave skins and Bootstrap 6's global
  defaults intact.

### Clean-slate implementation

- Do not mechanically copy or translate chulapa source code.
- Reconstruct components from their intended appearance and behavior.
- Avoid carrying over historical workarounds, obsolete dependencies or compatibility patches.
- Prefer simple, readable and maintainable implementations.
- Avoid premature abstractions and unnecessary configuration options.
- Remove unused code rather than preserving it for hypothetical future requirements.

Reusing original branding assets, fonts and other suitable static resources is acceptable.

### Technical debt

Technical debt reduction applies to every part of the project:

- Source code.
- Dependencies.
- Build infrastructure.
- Configuration.
- Documentation.
- Testing.
- Release workflows.

Every additional dependency, abstraction, configuration option or maintenance requirement should have a clear justification.

Do not reproduce complexity simply because it exists in chulapa.

## 5. Visual identity

Preserve the recognizable visual identity of chulapa, including:

- The original Chulapa branding typeface.
- General typography and visual hierarchy.
- Page layouts.
- Navigation patterns.
- Skins and color customization.
- Core editorial components.

Visual continuity is more important than pixel-perfect reproduction.

Differences introduced by native Bootstrap 6 components are acceptable when they improve accessibility, consistency, performance or maintainability.

## 6. User-facing compatibility

Aim for the highest practical level of compatibility with existing chulapa websites.

Prioritize compatibility with:

- `_config.yml` options.
- YAML front matter.
- Layout names.
- Markdown content.
- Liquid includes intended as public interfaces.
- Existing content organization.
- Skin configuration.
- Auto Themer configuration.
- Font Awesome (native in chulapa -> opt-in in chulapa2).

Internal implementation compatibility is not required.

Do not preserve obsolete Bootstrap classes or implementation details at the expense of architectural simplicity.

Custom HTML, Sass, CSS and JavaScript written against Bootstrap 4 may require migration.

Document intentional breaking changes and provide practical migration instructions.

The ideal migration should require changing the theme reference and adapting the build workflow, with minimal changes to existing content and configuration.

## 7. Auto Themer and skins

The Auto Themer is a core feature of chulapa2.

Reimplement it using the modern theming capabilities available in Bootstrap 6.

Investigate and prioritize:

- CSS custom properties.
- Bootstrap 6 design tokens.
- Modern CSS color functions.
- OKLCH color spaces.
- Dynamic color generation.
- Native color modes.
- Dart Sass when compile-time processing is necessary.

Preserve the ability to generate a coherent theme from a user-defined primary color.

Respect explicit user-defined color overrides.

Ensure that generated palettes provide appropriate contrast across supported components, interaction states and color modes.

Do not reproduce the original Sass implementation unless a specific algorithm remains demonstrably appropriate.

Prefer runtime CSS solutions when they provide equivalent functionality without introducing additional complexity.

Validate the Auto Themer architecture before implementing the full skin collection.

## 8. Development fixtures and testing

During pre-release development, maintain a `test/` directory containing the original chulapa documentation and representative content.

These documents are temporary development fixtures, not the official documentation of chulapa2.

Use them to evaluate:

- Visual and functional parity.
- Markdown rendering.
- Front matter compatibility.
- Layout behavior.
- Responsive design.
- Navigation.
- Components.
- Skins.
- Auto Themer behavior.
- Light and dark color modes.
- Accessibility.
- Color contrast.
- Rendering regressions.

Use the original chulapa website as a visual reference where appropriate.

Prefer automated browser-based tests for critical behavior and visual regressions.

Before the first stable release:

- Remove the inherited chulapa documentation from the published website.
- Remove temporary documentation fixtures from the release distribution.
- Retain only relevant demonstration pages as public examples.
- Ensure that the published documentation describes chulapa2 exclusively.

Regression fixtures may remain in the development repository when they provide demonstrable testing value, but must not be published as user-facing documentation.

## 9. Documentation

Write all official documentation from scratch in English.

Follow the Diátaxis framework:

https://diataxis.fr/

Organize documentation according to four distinct user needs:

- **Tutorials:** learning-oriented content.
- **How-to guides:** task-oriented instructions.
- **Reference:** accurate and structured technical information.
- **Explanation:** conceptual understanding and architectural decisions.

Use the original chulapa documentation as a reference for functional coverage, not as a target for length, structure or page count.

The documentation must be substantially more concise and easier to maintain than the original chulapa documentation.

### Documentation principles

- Every page must address a clear user need.
- Prefer concise, practical explanations.
- Prefer working demonstrations over lengthy descriptions.
- Avoid redundant examples.
- Avoid duplicating information across pages.
- Maintain a single source of truth for each documented feature.
- Link to official Bootstrap 6 documentation instead of reproducing it.
- Document public interfaces rather than unnecessary implementation details.
- Avoid creating documentation for hypothetical or unsupported use cases.
- Provide a concise migration guide for existing chulapa users.

Documentation is part of the project's maintenance surface. Its size and complexity must be justified.

Do not inherit documentation debt from chulapa.

## 10. Documentation chatbot

Provide a documentation chatbot as part of the official chulapa2 website.

The chatbot must:

- Use the official chulapa2 documentation as its primary knowledge source.
- Provide answers grounded in documented functionality.
- Link to relevant documentation pages.
- Assist with installation, configuration, customization, troubleshooting and migration.
- Clearly acknowledge uncertainty when the documentation does not support an answer.
- Avoid recommending obsolete chulapa or Bootstrap 4 patterns.
- Exclude temporary development fixtures from its knowledge base.

The chatbot should complement written documentation, not replace it or justify unnecessary documentation content.

Prefer a low-maintenance architecture with automated synchronization when documentation changes.

The chatbot provider and implementation should be selected based on maintainability, accuracy, cost and integration complexity.

## 11. Quality requirements

Prioritize:

- Accessibility.
- Semantic HTML.
- Responsive design.
- Color contrast.
- Performance.
- Minimal dependencies.
- Progressive enhancement.
- Maintainability.
- Reproducible builds.
- Automated testing.

Use modern browser features consistent with the supported Bootstrap 6 browser requirements.

Do not introduce additional browser compatibility workarounds without a documented requirement.

## 12. Development roadmap

### Phase 1 — Technical foundation

- Consult the [Bootstrap 6 documentation index](https://getbootstrap.com/llms.txt)
  and the [Bootstrap 6 skills in `.agents/skills`](.agents/skills).
- Establish the repository structure.
- Configure Jekyll and Bootstrap 6.
- Establish the build and deployment workflows.
- Configure Dart Sass if required.
- Establish branding and typography.
- Set up automated testing.

### Phase 2 — Theming

- Develop an Auto Themer proof of concept.
- Validate the Bootstrap 6 theming architecture.
- Implement color modes.
- Establish skin architecture.
- Implement contrast and accessibility tests.

### Phase 3 — Visual reconstruction

- Reconstruct page layouts.
- Reconstruct navigation.
- Reconstruct editorial components.
- Reconstruct core chulapa functionality.
- Validate against the original chulapa documents.

### Phase 4 — Compatibility and stabilization

- Validate existing configuration options.
- Validate front matter and Markdown compatibility.
- Identify intentional breaking changes.
- Remove unnecessary custom code.
- Complete visual and functional regression testing.

### Phase 5 — Documentation and chatbot

- Write the new documentation following Diátaxis.
- Prepare demonstration pages.
- Write the migration guide.
- Implement the documentation chatbot.
- Remove inherited documentation from the published website.

### Phase 6 — First stable release

Release chulapa2 when:

- Bootstrap 6 provides a stable foundation.
- Core visual and functional requirements are satisfied.
- The Auto Themer is functional and validated.
- Accessibility and regression tests pass.
- Official documentation is complete.
- Demonstrations are available.
- Migration instructions are available.
- The documentation chatbot is operational.
- Temporary development content is excluded from the release.

## 13. Instructions for development agents

Use the Bootstrap 6 skills in `.agents/skills` as upstream reference material.
For chulapa2, follow the sections for application code and keep customizations
in project-owned files. Steps for contributing components or utilities to
Bootstrap itself apply to upstream development. Follow the vendor and skin
rules above when applying Sass, CSS, or token examples.

Before implementing a feature:

1. Identify its intended user-facing behavior in chulapa.
2. Determine whether Bootstrap 6 provides a native solution.
3. Select the simplest maintainable implementation.
4. Identify potential compatibility implications.
5. Implement and test the feature.
6. Document it only when necessary.

When making changes:

- Keep changes focused and reviewable.
- Do not modify unrelated components.
- Do not introduce dependencies without justification.
- Do not silently change public interfaces.
- Explain significant architectural decisions and trade-offs.
- Report limitations and unresolved issues.
- Do not claim successful testing unless tests have actually been executed.

When requirements are ambiguous, prefer the solution that minimizes long-term maintenance without sacrificing essential functionality.

Do not treat historical chulapa behavior as an unconditional requirement.

## 14. Guiding principle

**chulapa is the reference for what to build, not how to build it.**

Preserve the identity. Reconstruct the implementation. Reduce the maintenance burden.
