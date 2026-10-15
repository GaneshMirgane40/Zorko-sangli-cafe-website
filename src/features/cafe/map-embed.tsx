/** Keyless Google Maps embed (ADR-017, ADR-046). `query` is "lat,lng" or a verified address. */
export function MapEmbed({ query, title }: { query: string; title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full rounded-2xl border-0 md:aspect-auto md:h-full md:min-h-80"
      />
      <p className="text-body-sm text-on-surface-variant">The map is loaded from Google Maps.</p>
    </div>
  )
}
