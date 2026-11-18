#!/usr/bin/env python3
"""
Deterministic Material Symbols Outlined WOFF2 Subsetter for PresCMed (TASK-16).

Reads CANONICAL_MATERIAL_SYMBOLS_SUBSET from src/components/Icon.tsx,
explicitly prunes GSUB LookupType 4 (LigatureSubst) in-place using
reverse-cmap glyph names, subsets the font to only the used ASCII
codepoints + 135 canonical icon glyphs, instantiates constant axes
(wght=400, GRAD=0) while preserving dynamic axes (FILL 0..1, opsz 20..48),
and verifies 100% GSUB ligature resolution on the emitted WOFF2.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Options, Subsetter
from fontTools.varLib.instancer import instantiateVariableFont

REPO_ROOT = Path(__file__).resolve().parent.parent
ICON_TSX_PATH = REPO_ROOT / "src" / "components" / "Icon.tsx"
UPSTREAM_WOFF2_PATH = (
    REPO_ROOT / "node_modules" / "material-symbols" / "material-symbols-outlined.woff2"
)
OUTPUT_WOFF2_PATH = (
    REPO_ROOT / "src" / "assets" / "fonts" / "material-symbols-outlined.subset.woff2"
)


def extract_canonical_subset(icon_tsx: Path) -> list[str]:
    text = icon_tsx.read_text(encoding="utf-8")
    match = re.search(
        r"CANONICAL_MATERIAL_SYMBOLS_SUBSET\s*=\s*\[([\s\S]*?)\]\s*as\s*const",
        text,
    )
    if not match:
        raise RuntimeError(f"Could not locate CANONICAL_MATERIAL_SYMBOLS_SUBSET in {icon_tsx}")
    names = re.findall(r"'([a-z0-9_]+)'", match.group(1))
    if not names:
        raise RuntimeError("Empty CANONICAL_MATERIAL_SYMBOLS_SUBSET")
    if names != sorted(names):
        raise RuntimeError("CANONICAL_MATERIAL_SYMBOLS_SUBSET is not sorted alphabetically")
    if len(set(names)) != len(names):
        raise RuntimeError("CANONICAL_MATERIAL_SYMBOLS_SUBSET contains duplicates")
    return names


def iter_ligature_subtables(gsub_table):
    for lookup in gsub_table.LookupList.Lookup:
        ltype = lookup.LookupType
        for sub in lookup.SubTable:
            if ltype == 4:
                yield sub
            elif ltype == 7 and getattr(sub, "ExtensionLookupType", None) == 4:
                yield sub.ExtSubTable


def main() -> int:
    canonical_names = extract_canonical_subset(ICON_TSX_PATH)
    print(f"[1/5] Extracted {len(canonical_names)} canonical icon names from Icon.tsx")

    if not UPSTREAM_WOFF2_PATH.exists():
        raise FileNotFoundError(f"Upstream font not found: {UPSTREAM_WOFF2_PATH}")
    upstream_bytes = UPSTREAM_WOFF2_PATH.stat().st_size
    font = TTFont(str(UPSTREAM_WOFF2_PATH))

    cmap = font.getBestCmap()
    if not cmap:
        raise RuntimeError("Upstream font has no best cmap table")

    canonical_tuples: dict[tuple[str, ...], str] = {}
    used_codepoints: set[int] = set()
    for name in canonical_names:
        seq = []
        for ch in name:
            cp = ord(ch)
            if cp not in cmap:
                raise RuntimeError(f"Character {ch!r} (U+{cp:04X}) not in font cmap")
            used_codepoints.add(cp)
            seq.append(cmap[cp])
        canonical_tuples[tuple(seq)] = name

    print("[2/5] Pruning GSUB LookupType 4 (LigatureSubst) in-place...")
    gsub = font["GSUB"].table
    matched_names: set[str] = set()
    target_icon_glyphs: set[str] = set()

    for lig_sub in iter_ligature_subtables(gsub):
        for first_glyph in list(lig_sub.ligatures.keys()):
            kept = []
            for lig in lig_sub.ligatures[first_glyph]:
                tup = (first_glyph, *lig.Component)
                if tup in canonical_tuples:
                    kept.append(lig)
                    matched_names.add(canonical_tuples[tup])
                    target_icon_glyphs.add(lig.LigGlyph)
            if kept:
                lig_sub.ligatures[first_glyph] = kept
            else:
                del lig_sub.ligatures[first_glyph]

    missing = sorted(set(canonical_names) - matched_names)
    if missing:
        raise RuntimeError(f"Missing ligatures in upstream GSUB: {missing}")

    print(
        f"[3/5] Running Subsetter on {len(used_codepoints)} ASCII codepoints "
        f"+ {len(target_icon_glyphs)} target icon glyphs..."
    )
    options = Options()
    options.layout_features = ["liga", "rlig", "rclt"]
    options.layout_closure = True
    options.hinting = False
    options.desubroutinize = True
    options.glyph_names = False

    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=used_codepoints, glyphs=target_icon_glyphs)
    subsetter.subset(font)

    print("[4/5] Instantiating wght=400, GRAD=0 (preserving FILL and opsz)...")
    instantiateVariableFont(font, {"wght": 400, "GRAD": 0}, inplace=True)

    OUTPUT_WOFF2_PATH.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(str(OUTPUT_WOFF2_PATH))
    subset_bytes = OUTPUT_WOFF2_PATH.stat().st_size

    print("[5/5] Verifying emitted subset WOFF2...")
    reopened = TTFont(str(OUTPUT_WOFF2_PATH))
    axes = [ax.axisTag for ax in reopened["fvar"].axes]
    total_glyphs = len(reopened.getGlyphOrder())
    re_cmap = reopened.getBestCmap()
    re_glyph_set = set(reopened.getGlyphOrder())

    verified_names: set[str] = set()
    expected_re_tuples = {
        tuple(re_cmap[ord(ch)] for ch in name): name for name in canonical_names
    }
    for lig_sub in iter_ligature_subtables(reopened["GSUB"].table):
        for first_glyph, lig_list in lig_sub.ligatures.items():
            for lig in lig_list:
                tup = (first_glyph, *lig.Component)
                if tup in expected_re_tuples and lig.LigGlyph in re_glyph_set:
                    verified_names.add(expected_re_tuples[tup])

    if len(verified_names) != len(canonical_names):
        unverified = sorted(set(canonical_names) - verified_names)
        raise RuntimeError(f"Post-subset verification failed for: {unverified}")
    if total_glyphs > 300:
        raise RuntimeError(f"Expected <= 300 total glyphs, got {total_glyphs}")
    if not getattr(reopened["GSUB"].table, "FeatureVariations", None):
        raise RuntimeError("Post-subset verification failed: GSUB FeatureVariations (FILL=1) missing")

    savings_pct = round((upstream_bytes - subset_bytes) / upstream_bytes * 100, 2)
    print(
        f"SUCCESS: {OUTPUT_WOFF2_PATH.relative_to(REPO_ROOT)}\n"
        f"  Upstream WOFF2 : {upstream_bytes:,} bytes\n"
        f"  Subset WOFF2   : {subset_bytes:,} bytes (-{savings_pct}%)\n"
        f"  Total glyphs   : {total_glyphs} ({len(canonical_names)} unfilled + .fill variants + {len(used_codepoints)} ASCII + .notdef)\n"
        f"  Preserved axes : {axes}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
