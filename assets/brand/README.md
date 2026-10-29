# Roundup brand files

The Roundup mark is three rounded shapes gathered into an R: the tall pill is the stem, the large disc the bowl, the small disc the leg. People rounded up into one plan. The source of truth is the "Roundup" design system; `shared/ui`'s `Logo` component draws these same files, and the README uses them where a component can't render.

| File                                                | What it is                                                   | Use it for                                         |
| --------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `../svg/brand/banner-dark.svg` / `banner-light.svg` | Lockup, tagline and the brand shapes on a 1280×360 panel     | The README header (`<picture>` picks one by theme) |
| `../svg/brand/divider.svg`                          | A mauve → peach → lavender rule                              | Section breaks in Markdown                         |
| `../svg/logo/mark-{dark,light,mono}.svg`            | The mark alone: Mocha colours, Latte colours, `currentColor` | The `Logo` component, favicons, small spaces       |
| `../svg/logo/wordmark-{dark,light,mono}.svg`        | "Roundup" as outlined paths, cropped to the letters          | The `Logo` component                               |
| `../svg/logo/lockup-{dark,light,mono}.svg`          | Mark and wordmark together, cropped to the artwork           | The `Logo` component, docs, slides                 |
| `../svg/illustrations/welcome-{dark,light}.svg`     | The mark with a cluster of dots                              | The `Welcome` screen                               |
| `../svg/icons/*.svg`                                | The 24-unit icon set, `currentColor` strokes                 | The `Icon` component                               |

All SVG artwork lives under `assets/svg`; only the font licence stays here. The `mono` files and every icon use `currentColor`, so the component sets their colour. The `dark` and `light` files carry the `logo-*` role colours of Mocha and Latte as literal values, and `shared/ui/tests/components/Logo.test.tsx` fails if they drift from `shared/tokens`. The favicon is a build-time copy of `logo/mark-dark.svg` (`scripts/copy-favicon.ts`), not a second file to maintain.

## Colours

| Theme         | Stem (`logo-stem`) | Bowl (`logo-bowl`) | Leg (`logo-leg`) | Wordmark (`fg`) |
| ------------- | ------------------ | ------------------ | ---------------- | --------------- |
| Mocha (dark)  | `#cba6f7`          | `#fab387`          | `#b4befe`        | `#cdd6f4`       |
| Latte (light) | `#8839ef`          | `#fe640b`          | `#7287fd`        | `#4c4f69`       |

## Rules

- **Lockup geometry:** the mark at size _s_, a gap of round(0.28 _s_), and "Roundup" in Onest Bold at round(0.75 _s_) with −0.03em letter-spacing, centred on the mark.
- **Clear space:** a quarter of the mark's size on every side.
- **Smallest sizes:** 16 px for the mark, 24 px for the lockup.
- **Don't** rotate or outline the mark, recolour single shapes, or put the brand colours on an accent fill (use the mono mark there).

## How these were made

The wordmark and tagline are [Onest](https://fonts.google.com/specimen/Onest) (SIL Open Font License, see `OFL-Onest.txt`), outlined to SVG paths so they look the same everywhere without loading a font. Text was shaped with HarfBuzz and outlined with fontTools from Onest's variable font at weight 700 (wordmark) and 500 (tagline). The mark files are copied from the design system; the lockup and wordmark files were cropped to their artwork (the old files carried the clear space).
