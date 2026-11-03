#!/usr/bin/env bash
# 把最新的 H5 产物同步到 iOS 壳工程的 www 目录
# 用法: bash ios-wrapper/sync-www.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/hbuilder-ios-app/www"
DST="$(cd "$(dirname "$0")" && pwd)/www"

if [ ! -f "$SRC/index.html" ]; then
  echo "[!] 缺少 $SRC/index.html，请先执行 bash build-ios-h5.sh"
  exit 1
fi

rm -rf "$DST"
mkdir -p "$DST"
cp -rf "$SRC/." "$DST/"

echo "===== www 已同步 ====="
echo "来源: $SRC"
echo "目标: $DST"
echo "大小: $(du -sh "$DST" | cut -f1)"
