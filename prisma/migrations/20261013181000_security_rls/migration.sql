-- Hand-written migration: things Prisma's schema language cannot express (TRD §4, SECURITY.md).
--
-- 1. CHECK constraints (the database enforces business rules even if app validation has a bug).
-- 2. Row Level Security deny-all. The app connects through Prisma as the privileged `postgres`
--    role, which bypasses RLS, so ALL authorization lives in server code. RLS with no policies,
--    plus revoked privileges, stops anyone from using Supabase's auto-generated REST/GraphQL API
--    (with the public publishable/anon key or a user JWT) to read or write these tables.
-- Forward-only: to change any of this, add a new migration.

-- ---------------------------------------------------------------- CHECK constraints
ALTER TABLE "MenuCategory"
  ADD CONSTRAINT "MenuCategory_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT "MenuCategory_name_not_blank" CHECK (char_length(btrim("name")) > 0);

ALTER TABLE "MenuItem"
  ADD CONSTRAINT "MenuItem_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT "MenuItem_name_not_blank" CHECK (char_length(btrim("name")) > 0),
  -- ₹0.01 … ₹1,00,000
  ADD CONSTRAINT "MenuItem_price_range" CHECK ("pricePaise" > 0 AND "pricePaise" <= 10000000);

-- At most 4 images per item: positions 0..3 plus UNIQUE (menuItemId, sortOrder).
ALTER TABLE "MenuItemImage"
  ADD CONSTRAINT "MenuItemImage_sort_range" CHECK ("sortOrder" BETWEEN 0 AND 3);

ALTER TABLE "AddOnGroup"
  ADD CONSTRAINT "AddOnGroup_select_range"
    CHECK ("minSelect" >= 0 AND "maxSelect" >= 1 AND "minSelect" <= "maxSelect");

ALTER TABLE "AddOnOption"
  ADD CONSTRAINT "AddOnOption_price_range" CHECK ("priceDeltaPaise" >= 0 AND "priceDeltaPaise" <= 10000000);

ALTER TABLE "ItemRelation"
  ADD CONSTRAINT "ItemRelation_not_self" CHECK ("fromItemId" <> "toItemId");

ALTER TABLE "Offer"
  ADD CONSTRAINT "Offer_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT "Offer_dates_order" CHECK ("endsAt" > "startsAt"),
  -- INFO offers have no price; DISCOUNT and COMBO offers must have a positive price.
  -- `IS NOT NULL` is required: `NULL > 0` is NULL, and a CHECK that evaluates to NULL passes.
  ADD CONSTRAINT "Offer_price_matches_kind" CHECK (
    ("kind" = 'INFO' AND "promoPricePaise" IS NULL) OR
    ("kind" <> 'INFO' AND "promoPricePaise" IS NOT NULL AND
      "promoPricePaise" > 0 AND "promoPricePaise" <= 10000000)
  );

ALTER TABLE "OfferMenuItem"
  ADD CONSTRAINT "OfferMenuItem_quantity_range" CHECK ("quantity" BETWEEN 1 AND 20);

ALTER TABLE "PromotionalBanner"
  ADD CONSTRAINT "PromotionalBanner_dates_order"
    CHECK ("startsAt" IS NULL OR "endsAt" IS NULL OR "endsAt" > "startsAt");

ALTER TABLE "CafeInformation"
  ADD CONSTRAINT "CafeInformation_singleton" CHECK ("id" = 'cafe'),
  ADD CONSTRAINT "CafeInformation_latitude_range" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "CafeInformation_longitude_range" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT "CafeInformation_whatsapp_digits" CHECK ("whatsappNumber" IS NULL OR "whatsappNumber" ~ '^[0-9]{8,15}$');

-- Hours past midnight are not supported yet (Q-05).
ALTER TABLE "OpeningHours"
  ADD CONSTRAINT "OpeningHours_day_range" CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  ADD CONSTRAINT "OpeningHours_time_range" CHECK (
    "opensAtMin" BETWEEN 0 AND 1439 AND "closesAtMin" BETWEEN 0 AND 1440 AND
    ("isClosed" OR "opensAtMin" < "closesAtMin")
  );

ALTER TABLE "Feedback"
  ADD CONSTRAINT "Feedback_message_not_blank" CHECK (char_length(btrim("message")) > 0);

ALTER TABLE "RateLimitBucket"
  ADD CONSTRAINT "RateLimitBucket_count_positive" CHECK ("count" >= 0);

-- ---------------------------------------------------------------- RLS deny-all
-- Enable RLS on every table in `public` (including _prisma_migrations). No policies are created,
-- so `anon` and `authenticated` get zero rows and cannot write. A test asserts that every public
-- table has RLS enabled, so a table added later without RLS fails the build.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- Remove table, sequence and function privileges from the Supabase API roles (defence in depth on
-- top of RLS), now and for objects created later by the migration role. Skipped on a plain
-- Postgres without these roles.
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', r);
    END IF;
  END LOOP;
END $$;
