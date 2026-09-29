export interface Car {
  id: string
  userId: string
  make: string
  model: string
  year: number
  plate: string
  vin: string
  mileage: number
  createdAt: string
}

export interface WorkPart {
  id: string
  name: string
  article: string
  analog: string
  quantity: number
  unitPrice: number
}

export interface WorkEntry {
  id: string
  carId: string
  date: string
  mileage: number
  title: string
  stationName: string
  stationAddress: string
  note: string
  parts: WorkPart[]
  workPrice: number
  createdAt: string
}

export interface Reminder {
  id: string
  carId: string
  title: string
  dueDate: string
  dueMileage: number | null
  done: boolean
  createdAt: string
}

export interface MoneySplit {
  parts: number
  work: number
  total: number
}

export interface YearTotal extends MoneySplit {
  year: number
}

export interface CarTotal extends MoneySplit {
  carId: string
  label: string
  entries: number
}

export interface StationTotal extends MoneySplit {
  stationName: string
  entries: number
}
