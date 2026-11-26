# chulapa2

An independent successor to chulapa, built with Jekyll 4 and Bootstrap 6.

## Develop locally

Install Ruby 3.4 and Node.js 24, then run these commands from the repository root.

```sh
bundle install
npm ci
npm run preview
```

Open <http://127.0.0.1:4000/>. Restart the preview after editing source files.
Run `npm run build` to generate the site in `_site/`.

## Run the browser tests

```sh
npx playwright install chromium
npm test
```

The tests build a separate site in `_site_test/` with the unpublished
Markdown fixture and a `/chulapa2` base URL.

## Typeface

Chulapa is a typeface of the City Council of Madrid, designed and produced
by Joancarles Casasín and Pablo Gámez from an idea by Silvia Fernández
Palomar. The project uses the Chulapa Bold file distributed with chulapa
under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
