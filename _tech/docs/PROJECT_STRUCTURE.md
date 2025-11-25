# Clean Architecture - Final Structure

## Directory Layout

```
Test Antigravity/
├── __pages/                     # Jekyll pages (auto-discovered)
│   ├── index.md
│   ├── about.md
│   ├── projects.md
│   └── experience.md
│
├── _tech/                      # Technical infrastructure
│   ├── config/
│   │   ├── package.json
│   │   └── .pre-commit-config.yaml
│   ├── docs/
│   │   ├── ARCHITECTURE.md
│   │   ├── BEGINNER_GUIDE.md
│   │   ├── FIXES.md
│   │   ├── SECURITY.md
│   │   └── PROJECT_STRUCTURE.md
│   └── tests/
│       └── ship-controls.test.js
│
├── content/                    # Source content (backup/editing)
│   └── _pages/
│       ├── index.md
│       ├── about.md
│       ├── projects.md
│       └── experience.md
│
├── theme/                      # Theme assets
│   ├── assets/
│   │   ├── js/
│   │   │   ├── core/          # Core modules
│   │   │   ├── systems/       # Game systems
│   │   │   ├── entities/      # Game entities
│   │   │   └── space-scene.js
│   │   └── css/
│   └── _layouts/
│
├── _config.yml                 # Jekyll configuration
├── _site/                      # Generated (gitignored)
├── Gemfile
└── README.md
```

## How It Works

### Jekyll Native Collections

Jekyll automatically discovers pages in `__pages/` directory when configured with:

```yaml
collections:
  pages:
    output: true
    permalink: /:name/
```

### Content Workflow

1. **Edit**: Modify files in `content/_pages/` (source of truth)
2. **Sync**: Copy to `__pages/` for Jekyll to build
3. **Build**: Jekyll generates `_site/` from `__pages/`

### Technical Files

All technical files are in `_tech/`:
- **config/**: Build configuration
- **docs/**: Technical documentation  
- **tests/**: Unit tests

### Benefits

✅ **No symlinks** - Pure Jekyll configuration
✅ **Clean separation** - Content vs. technical files
✅ **Standard conventions** - Uses Jekyll `_pages` pattern
✅ **Easy maintenance** - Clear file organization
