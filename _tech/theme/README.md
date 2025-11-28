# Space Odyssey Jekyll Theme (Gem)

This folder contains the gemspec and minimal Ruby tooling to package the existing Space Odyssey assets as a reusable Jekyll theme.

## Structure
- `_layouts/` – layouts shipped with the theme.
- `_includes/` – partials (add here if you create any).
- `assets/` – compiled CSS/JS and static assets.
- `DOCS.md` – internal docs for the theme.
- `jekyll-theme-space-odyssey.gemspec` – gem specification.
- `Gemfile` – allows `bundle install` and `bundle exec jekyll build` for testing the gem locally.

## Using locally
1) From this folder, run `bundle install`.
2) To build/test the gem as a theme: `bundle exec jekyll build --trace`.
3) To install the gem locally: `gem build jekyll-theme-space-odyssey.gemspec && gem install jekyll-theme-space-odyssey-0.1.0.gem`.

The main site can continue to reference the `theme/` directory directly; this gem packaging is for reuse or publishing if desired.
