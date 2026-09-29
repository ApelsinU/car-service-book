import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import Page from '../components/Page'
import { formatDate, formatMileage, formatMoney, formatNumber } from '../lib/format'
import { entriesForCar, sortByDateDesc, sumEntries } from '../store/selectors'
import { useGarageStore } from '../store/useGarageStore'
import { useMyGarage } from '../store/useMyGarage'
import './CarsPage.scss'

const EMPTY_FORM = { make: '', model: '', year: '', plate: '', vin: '', mileage: '' }

export default function CarsPage() {
  const { cars, entries } = useMyGarage()
  const currentUserId = useAuthStore((state) => state.currentUserId)
  const addCar = useGarageStore((state) => state.addCar)
  const removeCar = useGarageStore((state) => state.removeCar)
  const updateCar = useGarageStore((state) => state.updateCar)

  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  const setField = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (error) setError(null)
  }

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUserId) return

    const year = Number(form.year)
    const mileage = Number(form.mileage || 0)

    if (!form.make.trim() || !form.model.trim()) {
      setError('Укажите марку и модель')
      return
    }
    if (form.year && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
      setError('Год выпуска должен быть числом от 1900 до 2100')
      return
    }
    if (mileage < 0) {
      setError('Пробег не может быть отрицательным')
      return
    }

    addCar({
      userId: currentUserId,
      make: form.make.trim(),
      model: form.model.trim(),
      year: year || new Date().getFullYear(),
      plate: form.plate.trim(),
      vin: form.vin.trim().toUpperCase(),
      mileage,
    })

    setForm(EMPTY_FORM)
  }

  const totalMileage = cars.reduce((sum, car) => sum + car.mileage, 0)
  const grandTotal = sumEntries(entries)

  return (
    <Page
      title="Личный кабинет"
      subtitle="Ваши автомобили, пробеги и расходы"
      actions={
        <Link className="btn btn-primary" to="/new">
          Новая запись
        </Link>
      }
    >
      <div className="stats">
        <div className="stat">
          <span className="stat-label">Автомобилей</span>
          <span className="stat-value">{formatNumber(cars.length)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Суммарный пробег</span>
          <span className="stat-value">{formatMileage(totalMileage)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Запчасти</span>
          <span className="stat-value">{formatMoney(grandTotal.parts)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Работы</span>
          <span className="stat-value">{formatMoney(grandTotal.work)}</span>
        </div>
        <div className="stat stat-total">
          <span className="stat-label">Всего расходов</span>
          <span className="stat-value">{formatMoney(grandTotal.total)}</span>
        </div>
      </div>

      <div className="cars">
        {cars.map((car) => {
          const carEntries = sortByDateDesc(entriesForCar(entries, car.id))
          const split = sumEntries(carEntries)
          const last = carEntries[0]

          return (
            <article className="car" key={car.id}>
              <header className="car-head">
                <div>
                  <h2 className="car-name">
                    {car.make} {car.model}
                  </h2>
                  <p className="car-meta">
                    {car.year}
                    {car.plate ? ` · ${car.plate}` : ''}
                    {car.vin ? ` · VIN ${car.vin}` : ''}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Удалить ${car.make} ${car.model} и все записи журнала?`)) {
                      removeCar(car.id)
                    }
                  }}
                >
                  Удалить
                </button>
              </header>

              <div className="car-mileage">
                <label className="field">
                  <span className="field-label">Пробег, км</span>
                  <input
                    className="field-input"
                    type="number"
                    min={0}
                    step={1}
                    value={car.mileage}
                    onChange={(event) => updateCar(car.id, { mileage: Number(event.target.value) || 0 })}
                  />
                </label>
              </div>

              <dl className="car-money">
                <div>
                  <dt>Запчасти</dt>
                  <dd>{formatMoney(split.parts)}</dd>
                </div>
                <div>
                  <dt>Работы</dt>
                  <dd>{formatMoney(split.work)}</dd>
                </div>
                <div>
                  <dt>Итого</dt>
                  <dd>{formatMoney(split.total)}</dd>
                </div>
                <div>
                  <dt>Записей</dt>
                  <dd>{formatNumber(carEntries.length)}</dd>
                </div>
              </dl>

              <p className="car-last">
                {last
                  ? `Последняя запись: ${formatDate(last.date)} — ${last.title}`
                  : 'Записей в журнале пока нет'}
              </p>

              <Link className="btn btn-sm" to={`/journal?car=${car.id}`}>
                Журнал авто
              </Link>
            </article>
          )
        })}

        {cars.length === 0 && <p className="empty">Автомобилей пока нет — добавьте первый ниже</p>}
      </div>

      <section className="panel">
        <h2 className="panel-title">Добавить автомобиль</h2>
        <form className="form-grid" onSubmit={handleAdd} noValidate>
          <label className="field">
            <span className="field-label">Марка *</span>
            <input
              className="field-input"
              value={form.make}
              onChange={(event) => setField('make', event.target.value)}
              placeholder="Kia"
            />
          </label>

          <label className="field">
            <span className="field-label">Модель *</span>
            <input
              className="field-input"
              value={form.model}
              onChange={(event) => setField('model', event.target.value)}
              placeholder="Sorento"
            />
          </label>

          <label className="field">
            <span className="field-label">Год выпуска</span>
            <input
              className="field-input"
              type="number"
              min={1900}
              max={2100}
              value={form.year}
              onChange={(event) => setField('year', event.target.value)}
              placeholder="2015"
            />
          </label>

          <label className="field">
            <span className="field-label">Госномер</span>
            <input
              className="field-input"
              value={form.plate}
              onChange={(event) => setField('plate', event.target.value)}
              placeholder="А123ВС 77"
            />
          </label>

          <label className="field">
            <span className="field-label">VIN</span>
            <input
              className="field-input"
              value={form.vin}
              onChange={(event) => setField('vin', event.target.value)}
              placeholder="X7…"
            />
          </label>

          <label className="field">
            <span className="field-label">Пробег, км</span>
            <input
              className="field-input"
              type="number"
              min={0}
              step={1}
              value={form.mileage}
              onChange={(event) => setField('mileage', event.target.value)}
              placeholder="0"
            />
          </label>

          {error && (
            <p className="alert form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-submit">
            <button className="btn btn-primary" type="submit">
              Добавить авто
            </button>
          </div>
        </form>
      </section>
    </Page>
  )
}
