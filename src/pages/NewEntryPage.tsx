import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../components/Page'
import { formatMoney } from '../lib/format'
import { yandexMapsUrl } from '../lib/maps'
import { createId } from '../lib/id'
import { partsTotal } from '../store/selectors'
import { useGarageStore } from '../store/useGarageStore'
import { useMyGarage } from '../store/useMyGarage'
import type { WorkPart } from '../types'
import './NewEntryPage.scss'

interface PartDraft {
  id: string
  name: string
  article: string
  analog: string
  quantity: string
  unitPrice: string
}

function emptyPart(): PartDraft {
  return { id: createId(), name: '', article: '', analog: '', quantity: '1', unitPrice: '' }
}

function toPart(draft: PartDraft): WorkPart {
  return {
    id: draft.id,
    name: draft.name.trim(),
    article: draft.article.trim(),
    analog: draft.analog.trim(),
    quantity: Math.max(0, Number(draft.quantity) || 0),
    unitPrice: Math.max(0, Number(draft.unitPrice) || 0),
  }
}

export default function NewEntryPage() {
  const { cars } = useMyGarage()
  const addEntry = useGarageStore((state) => state.addEntry)
  const navigate = useNavigate()

  const lastCar = cars[0]
  const [carId, setCarId] = useState(lastCar?.id ?? '')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [mileage, setMileage] = useState('')
  const [title, setTitle] = useState('')
  const [stationName, setStationName] = useState('')
  const [stationAddress, setStationAddress] = useState('')
  const [workPrice, setWorkPrice] = useState('')
  const [note, setNote] = useState('')
  const [parts, setParts] = useState<PartDraft[]>([emptyPart()])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const previewParts = useMemo(
    () =>
      parts
        .map(toPart)
        .filter((part) => part.name || part.article || part.unitPrice),
    [parts],
  )
  const partsSum = partsTotal(previewParts)
  const workSum = Math.max(0, Number(workPrice) || 0)
  const mapsUrl = yandexMapsUrl(stationName, stationAddress)

  const selectedCar = cars.find((car) => car.id === carId)
  const mileageHint = selectedCar ? `Пробег авто: ${selectedCar.mileage} км` : ''

  const setPart = (id: string, key: keyof Omit<PartDraft, 'id'>, value: string) => {
    setParts((prev) => prev.map((part) => (part.id === id ? { ...part, [key]: value } : part)))
    if (error) setError(null)
  }

  const addPartRow = () => setParts((prev) => [...prev, emptyPart()])

  const removePartRow = (id: string) =>
    setParts((prev) => {
      const next = prev.filter((part) => part.id !== id)
      return next.length ? next : [emptyPart()]
    })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (cars.length === 0) {
      setError('Сначала добавьте автомобиль в личном кабинете')
      return
    }
    if (!carId) {
      setError('Выберите автомобиль')
      return
    }
    if (!date) {
      setError('Укажите дату работ')
      return
    }
    if (!title.trim()) {
      setError('Укажите название работы')
      return
    }
    if (!stationName.trim()) {
      setError('Укажите название станции обслуживания')
      return
    }

    const normalizedMileage = Number(mileage)
    addEntry({
      carId,
      date,
      mileage: Number.isFinite(normalizedMileage) && normalizedMileage >= 0 ? normalizedMileage : 0,
      title: title.trim(),
      stationName: stationName.trim(),
      stationAddress: stationAddress.trim(),
      note: note.trim(),
      parts: previewParts,
      workPrice: workSum,
    })

    setDone(true)
    navigate('/journal')
  }

  if (cars.length === 0) {
    return (
      <Page title="Новая запись" subtitle="Сначала добавьте автомобиль">
        <section className="panel">
          <p className="empty">В личном кабинете пока нет ни одного автомобиля</p>
        </section>
      </Page>
    )
  }

  return (
    <Page title="Новая запись в журнал" subtitle="Заполните данные о работах">
      <form className="entry-form" onSubmit={handleSubmit} noValidate>
        <section className="panel">
          <h2 className="panel-title">Автомобиль и дата</h2>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Автомобиль *</span>
              <select
                className="field-select"
                value={carId}
                onChange={(event) => setCarId(event.target.value)}
              >
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.year})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Дата работ *</span>
              <input
                className="field-input"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  if (error) setError(null)
                }}
              />
            </label>

            <label className="field">
              <span className="field-label">Пробег, км</span>
              <input
                className="field-input"
                type="number"
                min={0}
                step={1}
                value={mileage}
                onChange={(event) => setMileage(event.target.value)}
                placeholder="0"
              />
              {mileageHint && <span className="field-hint">{mileageHint}</span>}
            </label>

            <label className="field">
              <span className="field-label">Название работы *</span>
              <input
                className="field-input"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="Замена масла и фильтров"
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Станция обслуживания</h2>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Название СТО *</span>
              <input
                className="field-input"
                value={stationName}
                onChange={(event) => {
                  setStationName(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="Fit Service"
              />
            </label>

            <label className="field">
              <span className="field-label">Адрес</span>
              <input
                className="field-input"
                value={stationAddress}
                onChange={(event) => setStationAddress(event.target.value)}
                placeholder="Москва, ул. Примерная, 1"
              />
            </label>
          </div>

          {mapsUrl && (
            <p className="maps-preview">
              <a className="link" href={mapsUrl} target="_blank" rel="noreferrer noopener">
                Открыть в Яндекс Картах
              </a>
            </p>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Запчасти</h2>
            <button className="btn btn-sm" type="button" onClick={addPartRow}>
              + Добавить запчасть
            </button>
          </div>

          <div className="parts">
            {parts.map((draft, index) => {
              const lineTotal =
                Math.max(0, Number(draft.quantity) || 0) * Math.max(0, Number(draft.unitPrice) || 0)

              return (
                <div className="part" key={draft.id}>
                  <div className="part-head">
                    <span className="part-index">Запчасть {index + 1}</span>
                    <button
                      className="btn btn-sm btn-danger"
                      type="button"
                      onClick={() => removePartRow(draft.id)}
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span className="field-label">Название</span>
                      <input
                        className="field-input"
                        value={draft.name}
                        onChange={(event) => setPart(draft.id, 'name', event.target.value)}
                        placeholder="Масло моторное 5W-30"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Артикул</span>
                      <input
                        className="field-input"
                        value={draft.article}
                        onChange={(event) => setPart(draft.id, 'article', event.target.value)}
                        placeholder="5500450020"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Аналоги</span>
                      <input
                        className="field-input"
                        value={draft.analog}
                        onChange={(event) => setPart(draft.id, 'analog', event.target.value)}
                        placeholder="Liqui Moly, Motul"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Количество</span>
                      <input
                        className="field-input"
                        type="number"
                        min={0}
                        step="1"
                        value={draft.quantity}
                        onChange={(event) => setPart(draft.id, 'quantity', event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Цена за штуку, ₽</span>
                      <input
                        className="field-input"
                        type="number"
                        min={0}
                        step="1"
                        value={draft.unitPrice}
                        onChange={(event) => setPart(draft.id, 'unitPrice', event.target.value)}
                        placeholder="0"
                      />
                    </label>

                    <div className="field">
                      <span className="field-label">Сумма</span>
                      <span className="part-total">{formatMoney(lineTotal)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Стоимость и описание</h2>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Цена за все работы, ₽</span>
              <input
                className="field-input"
                type="number"
                min={0}
                step="1"
                value={workPrice}
                onChange={(event) => setWorkPrice(event.target.value)}
                placeholder="0"
              />
            </label>

            <label className="field">
              <span className="field-label">Дополнительное описание</span>
              <textarea
                className="field-textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Какие жидкости, какие работы, замечания мастера…"
              />
            </label>
          </div>

          <dl className="totals">
            <div>
              <dt>Цена за все запчасти</dt>
              <dd>{formatMoney(partsSum)}</dd>
            </div>
            <div>
              <dt>Цена за все работы</dt>
              <dd>{formatMoney(workSum)}</dd>
            </div>
            <div className="totals-grand">
              <dt>Итого</dt>
              <dd>{formatMoney(partsSum + workSum)}</dd>
            </div>
          </dl>

          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          {done && (
            <p className="alert alert-ok" role="status">
              Запись сохранена
            </p>
          )}

          <div className="submit-row">
            <button className="btn btn-primary" type="submit">
              Сохранить запись
            </button>
            <button className="btn" type="button" onClick={() => navigate('/journal')}>
              Отмена
            </button>
          </div>
        </section>
      </form>
    </Page>
  )
}
