#!/usr/bin/env python3
"""Export important project files into a single code.txt file.

Usage:
  python export.py
  python export.py --root . --output code.txt
  python export.py --exclude-tests
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_EXCLUDED_DIRS = {
    ".git",
    ".next",
    ".venv",
    "venv",
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".pytest_cache",
    ".mypy_cache",
    "__pycache__",
    ".idea",
    ".vscode",
}

DEFAULT_EXCLUDED_FILES = {
    "code.txt",
}

# Keep source/config/docs; skip media/binaries automatically.
IMPORTANT_EXTENSIONS = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".css",
    ".scss",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".env",
    ".sql",
    ".sh",
    ".txt",
    ".conf",
}

IMPORTANT_FILENAMES = {
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.prod.yml",
    "Makefile",
    "README",
    "README.md",
    "pytest.ini",
    "next.config.js",
    "postcss.config.js",
    "tailwind.config.ts",
    "tsconfig.json",
    "package.json",
    "requirements.txt",
    "requirements-dev.txt",
}

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024


def should_skip_dir(path: Path, exclude_tests: bool) -> bool:
    if path.name in DEFAULT_EXCLUDED_DIRS:
        return True
    if exclude_tests and path.name == "tests":
        return True
    return False


def is_important_file(path: Path, root: Path) -> bool:
    if path.name in DEFAULT_EXCLUDED_FILES:
        return False

    # Skip hidden cache/temp style files.
    if path.name.startswith(".") and path.suffix not in {".env", ".ini"}:
        return False

    # Ignore generated/large files.
    if path.stat().st_size > MAX_FILE_SIZE_BYTES:
        return False

    if path.name in IMPORTANT_FILENAMES:
        return True

    if path.suffix.lower() in IMPORTANT_EXTENSIONS:
        return True

    # Keep env examples even if naming differs.
    if path.name.endswith(".env.example") or path.name.endswith(".env.production.example"):
        return True

    # Keep Dockerfiles with custom names.
    if path.name.startswith("Dockerfile"):
        return True

    # Avoid exporting the output itself in nested scenarios.
    try:
        if path.resolve() == (root / "code.txt").resolve():
            return False
    except OSError:
        return False

    return False


def collect_files(root: Path, exclude_tests: bool) -> list[Path]:
    files: list[Path] = []

    for current_dir, dir_names, file_names in __import__("os").walk(root):
        current_path = Path(current_dir)

        # In-place prune for performance.
        dir_names[:] = [
            d
            for d in dir_names
            if not should_skip_dir(current_path / d, exclude_tests=exclude_tests)
        ]

        for file_name in file_names:
            file_path = current_path / file_name
            try:
                if file_path.is_file() and is_important_file(file_path, root):
                    files.append(file_path)
            except OSError:
                continue

    files.sort(key=lambda p: p.relative_to(root).as_posix())
    return files


def export_files(root: Path, output_file: Path, exclude_tests: bool) -> int:
    files = collect_files(root, exclude_tests=exclude_tests)

    header = [
        "# Smart Evaluation - Code Export",
        f"# Generated: {datetime.now(timezone.utc).isoformat()}",
        f"# Root: {root}",
        f"# Files exported: {len(files)}",
        "",
    ]

    chunks: list[str] = ["\n".join(header)]

    for file_path in files:
        rel = file_path.relative_to(root).as_posix()
        chunks.append(f"\n\n{'=' * 100}\nFILE: {rel}\n{'=' * 100}\n")

        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            content = f"[ERROR READING FILE: {exc}]\n"

        chunks.append(content)

    output_file.write_text("".join(chunks), encoding="utf-8")
    return len(files)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export important code files into code.txt")
    parser.add_argument("--root", default=".", help="Project root directory (default: current dir)")
    parser.add_argument("--output", default="code.txt", help="Output text file path (default: code.txt)")
    parser.add_argument(
        "--exclude-tests",
        action="store_true",
        help="Exclude tests directories from export",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    output_file = Path(args.output).resolve()

    count = export_files(root=root, output_file=output_file, exclude_tests=args.exclude_tests)
    print(f"Export complete. {count} files written to {output_file}")


if __name__ == "__main__":
    main()
