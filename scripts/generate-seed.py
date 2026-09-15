#!/usr/bin/env python3
"""
Generates `supabase/seed.sql` and `lib/catalog.ts` from `scripts/catalog.json`.

`scripts/catalog.json` is a verbatim JSON dump of the reference Express catalog:

    cd ../insaf-mart && npx tsx -e "
      import {CATEGORIES, COMBOS, PRODUCTS, ALL_SEED_PRODUCTS} from './server/catalog';
      import {writeFileSync} from 'node:fs';
      writeFileSync('../insaf-mart-next/scripts/catalog.json',
        JSON.stringify({categories:CATEGORIES, combos:COMBOS, products:PRODUCTS,
                        all:ALL_SEED_PRODUCTS}, null, 2));
    "

Then:  python3 scripts/generate-seed.py

Nothing in the catalog is hand-typed — re-run both steps whenever the reference
catalog changes.
"""

import json
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "scripts" / "catalog.json").read_text())


def q(value):
    """Single-quoted, SQL-escaped literal (or NULL)."""
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def jsonb(value):
    return q(json.dumps(value, ensure_ascii=False)) + "::jsonb"


def img(path: str) -> str:
    """`./images/x.webp` -> `/images/x.webp`"""
    return "/" + path.lstrip("./").lstrip("/") if path.startswith(".") else path


# --------------------------------------------------------------------------- #
# supabase/seed.sql                                                           #
# --------------------------------------------------------------------------- #

lines = [
    "-- Insaf Mart — seed data (5 categories + 52 catalog rows: 3 gift combos + 49 products).",
    "--",
    "-- GENERATED FILE — do not edit by hand.",
    "-- Produced by `scripts/generate-seed.py` from `scripts/catalog.json`,",
    "-- which is a JSON dump of the reference `server/catalog.ts`.",
    "--",
    "-- How to run: Supabase dashboard -> SQL Editor -> New query -> paste this file",
    "-- -> Run. Run `supabase/schema.sql` first. Re-running is safe: every statement",
    "-- is idempotent on the natural key (categories.slug / products.slug).",
    "",
    "begin;",
    "",
    "-- ------------------------------- categories ------------------------------- --",
    "",
]

cat_values = []
for i, c in enumerate(DATA["categories"], start=1):
    cat_values.append(
        "  ({}, {}, {}, {}, {}, {}, {})".format(
            i,
            q(c["id"]),
            q(c["label"]),
            q(c["tagline"]),
            q(c["blurb"]),
            q(img(c["image"])),
            i,
        )
    )

lines += [
    "insert into categories (id, slug, label, tagline, blurb, image, sort_order) values",
    ",\n".join(cat_values) + "",
    "on conflict (slug) do update set",
    "  label = excluded.label,",
    "  tagline = excluded.tagline,",
    "  blurb = excluded.blurb,",
    "  image = excluded.image,",
    "  sort_order = excluded.sort_order;",
    "",
    "select setval(pg_get_serial_sequence('categories', 'id'),"
    " coalesce((select max(id) from categories), 1));",
    "",
    "-- --------------------------------- products -------------------------------- --",
    "-- Order matches the reference seed exactly (combos first, then products), so",
    "-- product ids line up 1:1 with the Express/SQLite build.",
    "",
]

prod_values = []
for i, p in enumerate(DATA["all"], start=1):
    prod_values.append(
        "  ({id}, {slug}, {title}, {category}, {collection}, {description}, {price},"
        " {compare_price}, {stock}, {images}, {tags}, {variants}, {featured}, {is_combo})".format(
            id=i,
            slug=q(p["slug"]),
            title=q(p["title"]),
            category=q(p["category"]),
            collection=q(p.get("collection")),
            description=q(p["description"]),
            price=p["price"],
            compare_price="NULL" if p.get("comparePrice") is None else p["comparePrice"],
            stock=p["stock"],
            images=jsonb([f"/images/{p['slug']}.webp"]),
            tags=jsonb(p.get("tags", [])),
            variants=jsonb(p.get("variants", [])),
            featured=1 if p.get("featured") else 0,
            is_combo=1 if p.get("isCombo") else 0,
        )
    )

lines += [
    "insert into products",
    "  (id, slug, title, category, collection, description, price, compare_price,",
    "   stock, images, tags, variants, featured, is_combo)",
    "values",
    ",\n".join(prod_values),
    "on conflict (slug) do update set",
    "  title = excluded.title,",
    "  category = excluded.category,",
    "  collection = excluded.collection,",
    "  description = excluded.description,",
    "  price = excluded.price,",
    "  compare_price = excluded.compare_price,",
    "  stock = excluded.stock,",
    "  images = excluded.images,",
    "  tags = excluded.tags,",
    "  variants = excluded.variants,",
    "  featured = excluded.featured,",
    "  is_combo = excluded.is_combo;",
    "",
    "select setval(pg_get_serial_sequence('products', 'id'),"
    " coalesce((select max(id) from products), 1));",
    "",
    "commit;",
    "",
]

(ROOT / "supabase" / "seed.sql").write_text("\n".join(lines))

# --------------------------------------------------------------------------- #
# lib/catalog.ts                                                              #
# --------------------------------------------------------------------------- #


def ts(value, indent=2):
    return json.dumps(value, ensure_ascii=False, indent=indent)


cats = [
    {
        "id": c["id"],
        "label": c["label"],
        "tagline": c["tagline"],
        "blurb": c["blurb"],
        "image": img(c["image"]),
    }
    for c in DATA["categories"]
]

seed_products = []
for p in DATA["all"]:
    row = {
        "slug": p["slug"],
        "title": p["title"],
        "category": p["category"],
        "description": p["description"],
        "price": p["price"],
        "stock": p["stock"],
        "tags": p.get("tags", []),
        "images": [f"/images/{p['slug']}.webp"],
        "variants": p.get("variants", []),
        "featured": bool(p.get("featured")),
        "isCombo": bool(p.get("isCombo")),
    }
    if p.get("collection") is not None:
        row["collection"] = p["collection"]
    if p.get("comparePrice") is not None:
        row["comparePrice"] = p["comparePrice"]
    seed_products.append(row)

catalog_ts = f"""/**
 * GENERATED FILE — do not edit by hand.
 * Produced by `scripts/generate-seed.py` from `scripts/catalog.json`, itself a
 * JSON dump of the reference `server/catalog.ts`.
 *
 * Server-side only helper data: the 5 storefront categories and the 52 seed
 * catalog rows (3 gift combos first, then 49 products — same order as
 * `supabase/seed.sql`, so ids line up). Image paths are root-relative for
 * Next.js (`/images/<slug>.webp`).
 */

export type SeedProduct = {{
  slug: string;
  title: string;
  category: string;
  collection?: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  tags: string[];
  images: string[];
  variants: string[];
  featured: boolean;
  isCombo: boolean;
}};

export type SeedCategory = {{
  id: string;
  label: string;
  tagline: string;
  blurb: string;
  image: string;
}};

export const CATEGORIES: SeedCategory[] = {ts(cats)};

export const ALL_SEED_PRODUCTS: SeedProduct[] = {ts(seed_products)};

export const COMBOS: SeedProduct[] = ALL_SEED_PRODUCTS.filter((p) => p.isCombo);
export const PRODUCTS: SeedProduct[] = ALL_SEED_PRODUCTS.filter((p) => !p.isCombo);
"""

(ROOT / "lib" / "catalog.ts").write_text(catalog_ts)

print(
    "wrote supabase/seed.sql ({} categories, {} products) and lib/catalog.ts".format(
        len(cats), len(seed_products)
    )
)
