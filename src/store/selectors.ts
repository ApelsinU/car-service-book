import type {
  Car,
  CarTotal,
  MoneySplit,
  StationTotal,
  WorkEntry,
  WorkPart,
  YearTotal,
} from '../types'

export function partsTotal(parts: WorkPart[]): number {
  return parts.reduce((sum, part) => sum + part.quantity * part.unitPrice, 0)
}

export function entrySplit(entry: WorkEntry): MoneySplit {
  const parts = partsTotal(entry.parts)
  return { parts, work: entry.workPrice, total: parts + entry.workPrice }
}

export function entriesForCar(entries: WorkEntry[], carId: string | null): WorkEntry[] {
  if (!carId) return entries
  return entries.filter((entry) => entry.carId === carId)
}

export function sortByDateDesc(entries: WorkEntry[]): WorkEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}

export function searchEntries(entries: WorkEntry[], query: string): WorkEntry[] {
  const needle = query.trim().toLowerCase()
  const sorted = sortByDateDesc(entries)

  if (!needle) return sorted

  return sorted.filter((entry) => {
    const haystack = [
      entry.title,
      entry.stationName,
      entry.stationAddress,
      entry.note,
      String(entry.mileage),
      ...entry.parts.flatMap((part) => [part.name, part.article, part.analog]),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(needle)
  })
}

export function sumEntries(entries: WorkEntry[]): MoneySplit {
  return entries.reduce<MoneySplit>(
    (acc, entry) => {
      const split = entrySplit(entry)
      acc.parts += split.parts
      acc.work += split.work
      acc.total += split.total
      return acc
    },
    { parts: 0, work: 0, total: 0 },
  )
}

export function totalsByYear(entries: WorkEntry[]): YearTotal[] {
  const buckets = new Map<number, YearTotal>()

  for (const entry of entries) {
    const year = Number(entry.date.slice(0, 4))
    if (!Number.isFinite(year)) continue

    const split = entrySplit(entry)
    const bucket = buckets.get(year) ?? { year, parts: 0, work: 0, total: 0 }

    bucket.parts += split.parts
    bucket.work += split.work
    bucket.total += split.total
    buckets.set(year, bucket)
  }

  return [...buckets.values()].sort((a, b) => a.year - b.year)
}

export function totalsByCar(entries: WorkEntry[], cars: Car[]): CarTotal[] {
  const labels = new Map(cars.map((car) => [car.id, `${car.make} ${car.model}`.trim()]))

  return cars.map((car) => {
    const carEntries = entriesForCar(entries, car.id)
    return { carId: car.id, label: labels.get(car.id) ?? 'Авто', entries: carEntries.length, ...sumEntries(carEntries) }
  })
}

export function totalsByStation(entries: WorkEntry[]): StationTotal[] {
  const buckets = new Map<string, WorkEntry[]>()

  for (const entry of entries) {
    const key = entry.stationName.trim() || 'Не указано'
    const bucket = buckets.get(key)
    if (bucket) bucket.push(entry)
    else buckets.set(key, [entry])
  }

  return [...buckets.entries()]
    .map(([stationName, stationEntries]) => ({
      stationName,
      entries: stationEntries.length,
      ...sumEntries(stationEntries),
    }))
    .sort((a, b) => b.total - a.total)
}
