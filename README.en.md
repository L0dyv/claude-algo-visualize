# claude-algo-visualize

[中文](README.md)

An attempt to distill Claude Desktop's visualization capability into a standalone, reusable skill for interactive data structure and algorithm teaching.

## Demo

**Static content with SVG illustrations:**

![Static web demo](images/static-web-demo.png)

**Interactive step-by-step animations:**

![Interactive animation demo](images/interactive-animation-demo.gif)

![Interactive animation demo 2](images/interactive-animation-demo-2.gif)

[Live Demo](https://l0dyv.github.io/claude-algo-visualize/references/heap_overview.html) -- Full interactive reference implementation

## Features

- Generate complete interactive HTML teaching pages (single file, no external dependencies)
- Multiple input scenarios: PDF/textbook explanations, topic animations, code execution visualization, concept comparison
- Built-in CSS skeleton (with dark mode) and three JS animation templates
- SVG illustrations + step-by-step animations + code highlighting synchronization
- Array, complete binary tree, custom-coordinate tree and other visualization forms

## Installation

```bash
npx skills add L0dyv/claude-algo-visualize
```

Or manually clone to your Claude Code skills directory:

```bash
git clone https://github.com/L0dyv/claude-algo-visualize.git ~/.claude/skills/claude-algo-visualize
```

## Structure

```
claude-algo-visualize/
├── SKILL.md                  # Skill definition and usage guide
├── assets/
│   ├── base.css              # CSS skeleton (with dark mode)
│   ├── boilerplate.js        # JS animation templates (A/B/C)
│   └── animation-html.html   # HTML animation skeletons (3 variants)
└── references/
    └── heap_overview.html    # Complete reference implementation
```

## Usage

The skill activates automatically when you ask Claude Code to:

- Generate a teaching page from a PDF or textbook
- Create an animation for a topic (e.g., "demonstrate quicksort")
- Visualize code execution step by step
- Compare two concepts with side-by-side illustrations

## Acknowledgments

This project thanks the [Linux.do](https://linux.do) community for promoting open-source sharing.
