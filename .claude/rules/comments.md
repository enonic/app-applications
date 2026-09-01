---
paths:
  - '**/*.{ts,tsx}'
---

# Comments

Mirrors app-settings' `comments.md`.

Comment only what the code cannot say: a workaround, a platform constraint, a non-obvious ordering, a
decision that looks wrong until you know why. Never restate the code, and never leave a comment that
will outlive its reason.

| Marker     | For                                                             |
| ---------- | --------------------------------------------------------------- |
| `// !`     | a constraint or trap — breaking it breaks something non-obvious |
| `// ?`     | a decision worth the reader's doubt, with the reasoning         |
| `// *`     | a section header in a long file, framed by `// *` lines         |
| `// TODO:` | work with a named owner elsewhere — a phase, an issue           |

- Docstrings say what a thing is for, not what its signature already shows.
- Prose in comments is full sentences, and it is allowed to be long where the reason is.
- A `// !` about the host boundary or the shadow root is load-bearing: it is the only place those
  constraints are written down in code.
