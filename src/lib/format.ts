const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const numberFormat = new Intl.NumberFormat('ru-RU')

export function formatMoney(value: number): string {
  return rub.format(Number.isFinite(value) ? value : 0)
}

export function formatNumber(value: number): string {
  return numberFormat.format(Number.isFinite(value) ? value : 0)
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

export function formatMileage(value: number): string {
  return `${formatNumber(value)} км`
}
