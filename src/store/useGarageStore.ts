import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createId } from '../lib/id'
import type { Car, Reminder, WorkEntry } from '../types'

type CarInput = Omit<Car, 'id' | 'createdAt'>
type CarPatch = Partial<Omit<Car, 'id'>>
type EntryInput = Omit<WorkEntry, 'id' | 'createdAt'>
type EntryPatch = Partial<Omit<WorkEntry, 'id'>>
type ReminderInput = Omit<Reminder, 'id' | 'createdAt' | 'done'>
type ReminderPatch = Partial<Omit<Reminder, 'id'>>

const STORE_VERSION = 2

export interface GarageState {
  cars: Car[]
  entries: WorkEntry[]
  reminders: Reminder[]
  activeCarId: string | null
  hasHydrated: boolean

  setActiveCar: (id: string | null) => void
  setHasHydrated: (value: boolean) => void

  addCar: (car: CarInput) => string
  updateCar: (id: string, patch: CarPatch) => void
  removeCar: (id: string) => void

  addEntry: (entry: EntryInput) => string
  updateEntry: (id: string, patch: EntryPatch) => void
  removeEntry: (id: string) => void

  addReminder: (reminder: ReminderInput) => string
  updateReminder: (id: string, patch: ReminderPatch) => void
  toggleReminder: (id: string) => void
  removeReminder: (id: string) => void
}

export const useGarageStore = create<GarageState>()(
  persist(
    (set) => ({
      cars: [],
      entries: [],
      reminders: [],
      activeCarId: null,
      hasHydrated: false,

      setActiveCar: (activeCarId) => set({ activeCarId }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      addCar: (car) => {
        const id = createId()
        const createdAt = new Date().toISOString()

        set((state) => ({
          cars: [...state.cars, { ...car, id, createdAt }],
          activeCarId: state.activeCarId ?? id,
        }))

        return id
      },

      updateCar: (id, patch) =>
        set((state) => ({
          cars: state.cars.map((car) => (car.id === id ? { ...car, ...patch } : car)),
        })),

      removeCar: (id) =>
        set((state) => ({
          cars: state.cars.filter((car) => car.id !== id),
          entries: state.entries.filter((entry) => entry.carId !== id),
          reminders: state.reminders.filter((reminder) => reminder.carId !== id),
          activeCarId: state.activeCarId === id ? null : state.activeCarId,
        })),

      addEntry: (entry) => {
        const id = createId()
        const createdAt = new Date().toISOString()

        set((state) => ({
          entries: [...state.entries, { ...entry, id, createdAt }],
          cars: state.cars.map((car) =>
            car.id === entry.carId && entry.mileage > car.mileage
              ? { ...car, mileage: entry.mileage }
              : car,
          ),
        }))

        return id
      },

      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry,
          ),
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),

      addReminder: (reminder) => {
        const id = createId()
        const createdAt = new Date().toISOString()

        set((state) => ({
          reminders: [...state.reminders, { ...reminder, id, createdAt, done: false }],
        }))

        return id
      },

      updateReminder: (id, patch) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...patch } : reminder,
          ),
        })),

      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, done: !reminder.done } : reminder,
          ),
        })),

      removeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        })),
    }),
    {
      name: 'car-service-book',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cars: state.cars,
        entries: state.entries,
        reminders: state.reminders,
        activeCarId: state.activeCarId,
      }),
      migrate: () => ({
        cars: [],
        entries: [],
        reminders: [],
        activeCarId: null,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
