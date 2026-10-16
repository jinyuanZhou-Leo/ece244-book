#!/usr/bin/env python3
"""Translation workflow for the book, built on Sphinx gettext + sphinx-intl.

    uv run --group i18n python scripts/i18n.py extract   # refresh textbook/locale/*/LC_MESSAGES/*.po
    uv run python scripts/i18n.py build                  # build textbook/_build/html/<lang>/

English stays at the site root (textbook/_build/html); each translation is
built into a sub-directory named after its Sphinx language code.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "textbook"
BUILD = BOOK / "_build"
WORK = BUILD / "i18n"
LOCALE_DIR = BOOK / "locale"
BIN = Path(sys.executable).parent

# Keep in sync with LANGUAGES in textbook/_static/i18n/i18n.js
LANGUAGES = ["zh_CN"]

# Copied into the HTML output outside of jupyter-book (see netlify.toml); pages
# reference them with relative paths, so every language needs its own copy.
EXTRA_ASSETS = ["exercises", "trace"]


def run(*cmd):
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def extract(langs):
    pot_root = WORK / "pot"
    shutil.rmtree(pot_root / "_build" / "gettext", ignore_errors=True)
    run(BIN / "jupyter-book", "build", BOOK, "--all",
        "--builder", "custom", "--custom-builder", "gettext",
        "--path-output", pot_root)
    sphinx_intl = shutil.which("sphinx-intl", path=str(BIN))
    if not sphinx_intl:
        sys.exit("sphinx-intl not found; run with `uv run --group i18n ...`")
    run(sphinx_intl, "update",
        "-p", pot_root / "_build" / "gettext",
        "-d", LOCALE_DIR,
        "-w", "0",
        *[arg for lang in langs for arg in ("-l", lang)])


def build(langs, full):
    config = yaml.safe_load((BOOK / "_config.yml").read_text(encoding="utf-8"))
    WORK.mkdir(parents=True, exist_ok=True)

    for lang in langs:
        config["sphinx"]["config"]["language"] = lang
        config_path = WORK / f"_config.{lang}.yml"
        config_path.write_text(yaml.safe_dump(config, allow_unicode=True, sort_keys=False), encoding="utf-8")

        out = WORK / lang
        run(BIN / "jupyter-book", "build", BOOK,
            "--config", config_path, "--path-output", out,
            *(["--all"] if full else []))

        dest = BUILD / "html" / lang
        shutil.rmtree(dest, ignore_errors=True)
        shutil.copytree(out / "_build" / "html", dest)
        for name in EXTRA_ASSETS:
            src = BOOK / name
            if src.is_dir():
                shutil.copytree(src, dest / name, dirs_exist_ok=True)
        print(f"Built {lang} -> {dest.relative_to(ROOT)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    for name, help_text in [("extract", "extract messages and update .po files"),
                            ("build", "build translated HTML")]:
        p = sub.add_parser(name, help=help_text)
        p.add_argument("-l", "--language", action="append", choices=LANGUAGES,
                       help="language code (repeatable); default: all")
        if name == "build":
            p.add_argument("--all", action="store_true", help="rebuild all pages")
    args = parser.parse_args()

    langs = args.language or LANGUAGES
    if args.command == "extract":
        extract(langs)
    else:
        build(langs, args.all)


if __name__ == "__main__":
    main()
