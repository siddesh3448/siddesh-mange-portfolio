<div align="center">

# MINIMALIST ARCHITECT

### A personal portfolio by Siddesh Mallinath Mange

**Computer Science Student & Aspiring Developer & Cyber Security Student**

*Developer, by design.*

[GitHub](https://github.com/siddesh3448) · [LinkedIn](https://www.linkedin.com/in/siddesh-mallinath-mange-a44689351/) · [Email](mailto:siddeshmange258@gmail.com)

**HTML5** · **CSS3** · **JavaScript**

</div>

> **Portfolio URL:** Pending configuration. Add a verified live site URL here when one is available.

---

## Contents

| Section | Section | Section |
|:--|:--|:--|
| [Overview](#overview) | [Features](#features) | [Design system](#design-system) |
| [Technology](#technology) | [Project structure](#project-structure) | [Run locally](#run-locally) |
| [Customization](#customization) | [Deployment](#deployment) | [Contact](#contact) |

## Overview

**Minimalist Architect** is the personal portfolio of **Siddesh Mallinath Mange**, a Computer Science Engineering student at Parul University, expected to graduate in 2028. It presents selected projects, internship experience, education, skills, and ways to connect, with interests spanning software development and cybersecurity.

The site pairs an editorial, responsive layout with a restrained cosmic background. Project cards link to their listed GitHub repositories or project folders.

## Features

- Responsive portfolio layout and project showcase.
- Fixed canvas galaxy background with slowly drifting stars and subtle glows; clicking near a star on supported desktop pointers triggers a falling-star trail.
- Desktop custom cursor on supported fine-pointer devices, with responsive hover and press states.
- Scroll-triggered reveals, active-section navigation, and scroll progress indicator.
- Eight original miniature 3D companions, procedurally modeled from local Three.js geometry in one shared WebGL scene, with walking, blinking, waving, jumping, hover reactions, and pointer/touch dragging.
- About section with the original local profile portrait, a subtle orbit, light sweep, and desktop pointer parallax.
- Keyboard-visible focus states and a skip-to-content link.
- Reduced-motion handling for companion roaming and animation, portrait effects, and the cosmic canvas.
- Contact links for email, GitHub, and LinkedIn.

## Design system

| Token | Value | Use |
|:--|:--|:--|
| Obsidian | `#101010` | Main background |
| Warm white | `#F4F2ED` | Primary text |
| Electric lime | `#C7FF4D` | Accent and focus |
| Muted grey | `#A5A39D` | Secondary text |
| Surface | `#171717` | Raised surface |

The visual direction is minimalist and editorial: oversized type, deliberate spacing, clean alignment, and a small number of technical details. Motion is used selectively and follows the visitor’s reduced-motion preference.

## Technology

- **HTML5** for semantic page structure.
- **CSS3** for layout, responsive styling, typography, and motion styles.
- **Vanilla JavaScript** for canvas animation and interface interactions.
- **Three.js 0.186.1** for the locally bundled, shared WebGL renderer and original procedural companion models.

The companion models are original geometry created in `js/companions-3d.js`; no external character models or franchise assets are used. Three.js is distributed under the MIT License; see `js/vendor/THREE-LICENSE.txt`. The site remains static and requires no package manifest or build step.

## Project structure (website files)

```text
.
├── index.html
├── README.md
├── COPYRIGHT.md
├── favicon.svg
├── ProfilePhotoHeadshot.png
├── css/
│   └── styles.css
└── js/
    ├── companions-3d.js
    ├── main.js
    └── vendor/
        ├── THREE-LICENSE.txt
        ├── three.core.js
        └── three.module.js
```

The profile image is loaded from the project root.

## Run locally

### Prerequisites

- A modern web browser.
- No package installation or build tooling is required.

Serve the project over HTTP so the browser can load the local Three.js ES modules. For example, open the project folder in VS Code and use the Live Server extension to serve `index.html`. No package installation or build tooling is required.

## Customization

- **Name, headline, sections, projects, and social links:** Edit the corresponding content and anchors in `index.html`.
- **Profile photo:** Replace `ProfilePhotoHeadshot.png` in the project root, keeping that filename, or update the `src` on the `.portrait-image` element.
- **Projects:** Update each project card in `index.html`. Use verified destinations for repository links and preserve `rel="noopener noreferrer"` on links opened in a new tab.
- **Colors, typography, and responsive styling:** Edit the custom properties at the top of `css/styles.css`, including `--color-background`, `--color-text`, `--color-accent`, and `--color-muted`.
- **Motion and interactions:** Edit `js/main.js` for the canvas, navigation, cursor, and reveal behavior. Reduced-motion styles are in the `@media (prefers-reduced-motion: reduce)` block in `css/styles.css`.
- **Copyright:** The visible footer notice is in `index.html`; the usage statement is in `COPYRIGHT.md`.

## Deployment

This project is a static site and can be hosted with GitHub Pages. To publish it, configure Pages for the repository’s branch and root directory containing `index.html`, then use the deployment URL GitHub provides. No deployment URL is currently configured in this README.

## Screenshots

No screenshot asset is currently included in the project. To add a preview later, save a screenshot in the repository and embed it here using its relative path, for example:

```md
![Portfolio screenshot](path/to/screenshot.png)
```

## Copyright and use

Copyright © 2026 Siddesh Mallinath Mange. The original portfolio source code, design, layout, animations, and original assets are proprietary. No permission is granted to copy, modify, redistribute, or republish those materials for redistribution without prior written permission, except where applicable law permits otherwise. Third-party assets and materials remain subject to their respective owners’ terms and licenses. See [COPYRIGHT.md](COPYRIGHT.md) for the full notice.

## Contact

- **GitHub:** [github.com/siddesh3448](https://github.com/siddesh3448)
- **LinkedIn:** [Siddesh Mallinath Mange](https://www.linkedin.com/in/siddesh-mallinath-mange-a44689351/)
- **Email:** [siddeshmange258@gmail.com](mailto:siddeshmange258@gmail.com)

---

*Built with intention. Developer, by design.*
