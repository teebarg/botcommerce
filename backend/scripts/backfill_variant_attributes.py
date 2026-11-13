# scripts/backfill_variant_attributes.py
import asyncio
from prisma import Prisma

SQL = """
UPDATE "product_variants"
SET "attributes" = jsonb_strip_nulls(jsonb_build_object(
  'Size', "size",
  'Color', "color",
  'Width', CASE WHEN "width" IS NULL THEN NULL ELSE to_jsonb("width"::text) END,
  'Length', CASE WHEN "length" IS NULL THEN NULL ELSE to_jsonb("length"::text) END,
  'Age', "age",
  'Measurement', CASE WHEN "measurement" IS NULL THEN NULL ELSE to_jsonb("measurement"::text) END
))
WHERE "attributes" IS NULL OR "attributes" = '{}'::jsonb;
"""

async def main():
    db = Prisma()
    await db.connect()
    try:
        updated = await db.execute_raw(SQL)
        print(f"Updated {updated} rows")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())