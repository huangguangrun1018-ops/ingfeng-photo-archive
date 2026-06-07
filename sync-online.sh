#!/usr/bin/env zsh
set -euo pipefail

message="${1:-同步更新网站内容}"

git add .gitignore CNAME README.md index.html script.js styles.css sync-online.sh assets/photos
git commit -m "$message"
git push origin main
