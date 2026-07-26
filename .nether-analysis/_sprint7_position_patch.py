from pathlib import Path

root = Path(r"c:\Shopify\nether-main")

old = """  assign content_position = section.settings.nether_content_position | default: 'bottom-left'
  if content_position == 'center'
    assign content_position = 'middle-center'
  endif"""

new = """  assign content_position = section.settings.nether_content_position | default: 'bottom-left'
  capture content_position
    render 'nether-position-value', position: content_position, default: 'bottom-left'
  endcapture
  assign content_position = content_position | strip"""

cards = [
    "snippets/nether-product-card.liquid",
    "snippets/nether-product-promotional-card.liquid",
    "snippets/nether-collection-card.liquid",
    "snippets/nether-media-card.liquid",
]

for path in cards:
    p = root / path
    text = p.read_text(encoding="utf-8")
    if old not in text:
        print("MISS", path)
        # show nearby lines
        idx = text.find("content_position")
        print(repr(text[idx:idx+200]) if idx >= 0 else "no content_position")
    else:
        p.write_text(text.replace(old, new, 1), encoding="utf-8")
        print("OK", path)

# Normalize hero-shell section position assigns
section_patches = [
    (
        "sections/nether-hero.liquid",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n  capture nether_content_position\n    render 'nether-position-value', position: nether_content_position, default: 'middle-center'\n  endcapture\n  assign nether_content_position = nether_content_position | strip\n",
    ),
    (
        "sections/nether-banner.liquid",
        "  assign nether_content_position = section.settings.nether_banner_content_position | default: 'middle-center'\n",
        "  assign nether_content_position = section.settings.nether_banner_content_position | default: 'middle-center'\n  capture nether_content_position\n    render 'nether-position-value', position: nether_content_position, default: 'middle-center'\n  endcapture\n  assign nether_content_position = nether_content_position | strip\n",
    ),
    (
        "sections/nether-content.liquid",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n  capture nether_content_position\n    render 'nether-position-value', position: nether_content_position, default: 'middle-center'\n  endcapture\n  assign nether_content_position = nether_content_position | strip\n",
    ),
    (
        "sections/nether-cta.liquid",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n  capture nether_content_position\n    render 'nether-position-value', position: nether_content_position, default: 'middle-center'\n  endcapture\n  assign nether_content_position = nether_content_position | strip\n",
    ),
    (
        "sections/nether-newsletter.liquid",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n",
        "  assign nether_content_position = section.settings.nether_content_position | default: 'middle-center'\n  capture nether_content_position\n    render 'nether-position-value', position: nether_content_position, default: 'middle-center'\n  endcapture\n  assign nether_content_position = nether_content_position | strip\n",
    ),
]

for path, old_s, new_s in section_patches:
    p = root / path
    text = p.read_text(encoding="utf-8")
    if old_s not in text:
        print("MISS section", path)
    elif "nether-position-value" in text:
        print("SKIP already", path)
    else:
        p.write_text(text.replace(old_s, new_s, 1), encoding="utf-8")
        print("OK section", path)
