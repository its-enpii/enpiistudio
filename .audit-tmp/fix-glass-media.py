#!/usr/bin/env python3
"""Split unguarded `:root:not([data-theme='light'])` selectors in glassmorphism.css
into @media (prefers-color-scheme: dark) blocks so auto-dark no longer leaks into
explicit-light / no-preference users. Mirrors the guard pattern used by base
tokens.css and the material/neumorphism layers."""
import re, sys

PATH = "/root/projects/enpiistudio/packages/ui/styles/glassmorphism.css"
src = open(PATH).read()

BAD = ":root:not([data-theme='light'])"

# Tokenise into top-level segments: at-rules (with body) or rules/comments.
i = 0
out = []
changed = 0

def split_selector(sel):
    """Return (kept, moved) selector lists; moved = ones containing BAD."""
    parts = [s.strip() for s in sel.split(",")]
    kept = [s for s in parts if BAD not in s]
    moved = [s for s in parts if BAD in s]
    return kept, moved

def fmt_sel(parts):
    return ",\n".join(parts)

def process_block(block):
    """Process the contents of an at-rule body (nested context)."""
    global changed
    res = []
    i = 0
    n = len(block)
    while i < n:
        # comments
        m = re.match(r"\s*/\*.*?\*/", block[i:], re.S)
        if m:
            res.append(m.group(0)); i += m.end(); continue
        ws = re.match(r"\s+", block[i:])
        if ws:
            res.append(ws.group(0)); i += ws.end(); continue
        if block[i] == "@":
            # nested at-rule: copy header, recurse into body
            hdr = re.match(r"@\w[^{}]*\{", block[i:])
            if not hdr:
                # statement at-rule like @import; copy to ;
                end = block.index(";", i)
                res.append(block[i:end+1]); i = end+1; continue
            depth = 1; j = i + hdr.end()
            while depth:
                if block[j] == "{": depth += 1
                elif block[j] == "}": depth -= 1
                j += 1
            inner = block[i+hdr.end():j-1]
            res.append(hdr.group(0))
            res.append(process_block(inner))
            res.append("}")
            i = j
            continue
        # plain rule
        brace = block.index("{", i)
        sel = block[i:brace].strip()
        depth = 1; j = brace + 1
        while depth:
            if block[j] == "{": depth += 1
            elif block[j] == "}": depth -= 1
            j += 1
        body = block[brace+1:j-1]
        kept, moved = split_selector(sel)
        if moved:
            changed += 1
            if kept:
                res.append(fmt_sel(kept) + " {" + body + "}\n")
            res.append("@media (prefers-color-scheme: dark) {\n")
            res.append("  " + fmt_sel(moved) + " {" + body + "}\n")
            res.append("}\n")
        else:
            res.append((sel + " {" + body + "}\n") if sel else "")
        i = j
    return "".join(res)

# Top level pass
n = len(src)
while i < n:
    m = re.match(r"\s*/\*.*?\*/", src[i:], re.S)
    if m:
        out.append(m.group(0)); i += m.end(); continue
    ws = re.match(r"\s+", src[i:])
    if ws:
        out.append(ws.group(0)); i += ws.end(); continue
    if src[i] == "@":
        hdr = re.match(r"@\w[^{}]*\{", src[i:])
        if not hdr:
            end = src.index(";", i)
            out.append(src[i:end+1]); i = end+1; continue
        depth = 1; j = i + hdr.end()
        while depth:
            if src[j] == "{": depth += 1
            elif src[j] == "}": depth -= 1
            j += 1
        out.append(hdr.group(0))
        out.append(process_block(src[i+hdr.end():j-1]))
        out.append("}")
        i = j
        continue
    brace = src.index("{", i)
    sel = src[i:brace].strip()
    depth = 1; j = brace + 1
    while depth:
        if src[j] == "{": depth += 1
        elif src[j] == "}": depth -= 1
        j += 1
    body = src[brace+1:j-1]
    kept, moved = split_selector(sel)
    if moved:
        changed += 1
        if kept:
            out.append(fmt_sel(kept) + " {" + body + "}\n")
        out.append("@media (prefers-color-scheme: dark) {\n")
        out.append("  " + fmt_sel(moved) + " {" + body + "}\n")
        out.append("}\n")
    else:
        out.append(sel + " {" + body + "}\n")
    i = j

result = "".join(out)
open(PATH, "w").write(result)
print(f"split {changed} rules")
