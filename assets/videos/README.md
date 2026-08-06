# /assets/videos

This folder is intentionally empty in the scaffold. Every `<video>` element in
the site already has a `poster` image assigned (see `/assets/images`), so
pages render correctly with no video files present — the poster frame simply
displays as a static image until real footage is added.

## Expected filenames

Drop your exported `.mp4` (H.264, web-optimized) files in here using these
exact names so the existing markup and `project-data/projects.json` pick them
up automatically:

| Filename                                   | Used by                              |
| ------------------------------------------- | ------------------------------------ |
| `hero-reel.mp4`                             | Homepage hero background             |
| `drone-showcase.mp4`                        | Homepage drone section + drone.html  |
| `projects/fleet-farm-milwaukee-tool.mp4`    | Fleet Farm × Milwaukee Tool project  |
| `projects/von-maur.mp4`                     | Von Maur project                     |
| `projects/outlets-of-des-moines.mp4`        | Outlets of Des Moines project        |
| `projects/big-grove-world-cup.mp4`          | Big Grove World Cup project          |
| `projects/middlebrook-farm.mp4`             | Middlebrook Farm project             |

See the root `README.md` → "Replacing Videos" for export/compression guidance.
