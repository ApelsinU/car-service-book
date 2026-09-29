const YANDEX_MAPS_SEARCH = 'https://yandex.ru/maps/?text='

export function yandexMapsUrl(...parts: (string | undefined | null)[]): string | null {
  const query = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ')

  if (!query) return null

  return `${YANDEX_MAPS_SEARCH}${encodeURIComponent(query)}`
}
