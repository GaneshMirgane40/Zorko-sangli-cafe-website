/** Keyless Google Maps embed (ADR-017). Rendered only when coordinates are configured. */
export function MapEmbed({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${lat},${lng}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full rounded-2xl border-0 md:aspect-auto md:h-full md:min-h-80"
      />
      <p className="text-body-sm text-on-surface-variant">The map is loaded from Google Maps.</p>
    </div>
  )
}
