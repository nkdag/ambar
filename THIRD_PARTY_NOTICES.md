# Third-Party Notices

## BoardUI free source (current frontend)

AMBAR includes source-owned components and foundations copied from the local `boardui-free-pilot` free/MIT reference, then narrowly adapted for AMBAR. Copyright (c) 2026 Mertcan Dundar Esmergul (BoardUI). The complete [MIT license](./licenses/BoardUI-MIT.txt) is distributed with this repository. [Source paths and SHA-256 provenance](./src/styles/BOARDUI_SOURCE.json) record the copied originals and current adaptations. No BoardUI Pro source or demo assets are included.

The Control Room adds adapted free `dashboard/stat-cards.tsx`, `dashboard/revenue-chart-card.tsx`, `dashboard/orders-chart-card.tsx`, and `medical/important-alerts-card.tsx`. Their original and installed hashes are in the same provenance manifest.

Recharts (MIT), React Aria, Remix Icon and other installed packages retain their own licenses in their package distributions.

## Visual enhancement ($0)

- **Motion 13.2.0**, pinned exactly, MIT: [license](./licenses/Motion-MIT.txt). Uses springs and the lightweight React mini animation entry point, without paid Motion+ code.
- **Motion Primitives**, MIT, copyright (c) 2024 ibelick: AnimatedNumber and Spotlight adapted from commit `92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d`. [License](./licenses/Motion-Primitives-MIT.txt), [machine-readable source paths and original/installed SHA-256 hashes](./src/styles/VISUAL_SOURCE.json).
- `src/assets/ambar-shelf-contours.svg` is deterministic original AMBAR artwork, not a Haikei export. Existing self-hosted Inter/JetBrains Mono and Remix icons remain.
- Paper Shaders 0.0.80 was evaluated and **not installed or distributed**. Its WebGL initialization/failure handling and GPU surface add unnecessary complexity for this nonessential soft atmosphere; CSS/SVG provides the effect. No Paper source was copied, so no Paper LICENSE/NOTICE is distributed. This was a source-based decision, not a measured GPU benchmark.

## beUI (historical)

Historical attribution: the previous AMBAR frontend included adapted source components installed from the [beUI registry](https://github.com/starc007/ui-components), specifically the motion modal, drawer, tabs, and toast primitives. Those components have been removed in the BoardUI migration; this historical notice is preserved. The upstream project is licensed under the MIT License:

---

MIT License

Copyright (c) 2026 Saurabh Chauhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
