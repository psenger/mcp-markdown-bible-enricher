---
name: Implicit Chapter Inheritance
description: How parseChapterVerse() propagates chapter numbers across comma-separated verse groups
type: project
---

# Implicit Chapter Inheritance

`parseChapterVerse()` tracks `lastChapter` across comma-separated parts.
A bare verse or range (no `chapter:`) inherits the previous chapter.

```
"16:1, 4-13"   → ch16:v1 , ch16:v4-13
"23:1, 4, 6"   → ch23:v1 , ch23:v4 , ch23:v6
"2:1, 3:5"     → ch2:v1 , ch3:v5
```

- Chapter state resets for each new top-level regex match (not shared across references)
- Always applied — no exceptions or opt-out
- Separator is comma; dash means verse range within a chapter
