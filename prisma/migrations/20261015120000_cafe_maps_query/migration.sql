-- Additive: optional Google Maps place query for the café (ADR-046). No data is changed.
ALTER TABLE "CafeInformation" ADD COLUMN "mapsQuery" VARCHAR(200);
