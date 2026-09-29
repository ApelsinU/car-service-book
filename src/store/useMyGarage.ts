import { useMemo } from 'react'
import { useAuthStore } from '../auth/authStore'
import { useGarageStore } from './useGarageStore'
import type { Car, Reminder, WorkEntry } from '../types'

export interface MyGarage {
  cars: Car[]
  entries: WorkEntry[]
  reminders: Reminder[]
}

export function useMyGarage(): MyGarage {
  const userId = useAuthStore((state) => state.currentUserId)
  const cars = useGarageStore((state) => state.cars)
  const entries = useGarageStore((state) => state.entries)
  const reminders = useGarageStore((state) => state.reminders)

  return useMemo(() => {
    const myCars = cars.filter((car) => car.userId === userId)
    const carIds = new Set(myCars.map((car) => car.id))

    return {
      cars: myCars,
      entries: entries.filter((entry) => carIds.has(entry.carId)),
      reminders: reminders.filter((reminder) => carIds.has(reminder.carId)),
    }
  }, [cars, entries, reminders, userId])
}
