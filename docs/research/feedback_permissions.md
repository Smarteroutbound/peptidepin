---
name: no-permission-prompts
description: User trusts Claude fully - do not ask for permissions, just execute
type: feedback
---

Do not ask for permissions before taking actions. The user has given full trust.

**Why:** User explicitly said "don't ask for permissions anymore please. you have my trust."

**How to apply:** Execute all actions directly without confirmation prompts. This includes file operations, git commands, installs, deployments, etc.
