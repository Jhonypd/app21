````md
---
name: commit
description: 'Create commit messages following Sentry-style conventional commits.'
risk: safe
source: 'https://develop.sentry.dev/engineering-practices/commit-messages/'
date_added: '2026-02-27'
---

# Commit Messages (Sentry Style)

Use conventional commits following the Sentry format.

## Branch

Work on a feature branch.

```bash
git branch --show-current
```
````

If on `main` or `master`:

```bash
git checkout -b <type>/<short-description>
```

Examples:

```
feat/add-user-auth
fix/null-pointer
ref/extract-validation
```

---

# Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Rules:

- subject in **imperative present tense**
- capitalize first letter
- **max 70 characters**
- no period at end
- lines under **100 characters**

---

# Types

| Type    | Purpose                          |
| ------- | -------------------------------- |
| feat    | new feature                      |
| fix     | bug fix                          |
| ref     | refactor without behavior change |
| perf    | performance improvement          |
| docs    | documentation                    |
| test    | tests                            |
| build   | build system                     |
| ci      | CI configuration                 |
| chore   | maintenance                      |
| style   | formatting only                  |
| meta    | repository metadata              |
| license | license updates                  |

---

# Body

Explain:

- **what changed**
- **why it changed**

Avoid unnecessary implementation details.

Example:

```
feat(auth): Add refresh token support

Allow session renewal without requiring login after token expiration.
```

---

# Footer

Reference issues when relevant.

```
Fixes GH-1234
Fixes #1234
Fixes SENTRY-1234
Refs LINEAR-ABC-123
```

Rules:

- `Fixes` closes issue
- `Refs` only references

---

# AI Attribution

If an AI agent significantly contributed, include:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

Do not mention AI elsewhere.

---

# Principles

- one commit = one stable change
- commits should be independently reviewable
- repository should stay buildable

---

# Optional Architecture References

When commits involve backend or frontend architecture decisions,
consult these guides as **optional references**.

They are **not strict rules** and should be used only as guidance.

## Backend

- `.agent/skills/skills/backend-architect/SKILL.md`
- `.agent/skills/skills/backend-dev-guidelines/SKILL.md`

## Frontend

- `.agent/skills/skills/frontend-design/SKILL.md`
- `.agent/skills/skills/frontend-dev-guidelines/SKILL.md`
- `.agent/skills/skills/web-performance-optimization/SKILL.md`
- `.agent/skills/skills/web-artifacts-builder/SKILL.md`

```
Responder sempre em Português.
```
