import { Fragment, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Page from '../components/Page'
import { formatDate, formatMileage, formatMoney, formatNumber } from '../lib/format'
import { yandexMapsUrl } from '../lib/maps'
import { entrySplit, searchEntries, sumEntries } from '../store/selectors'
import { useGarageStore } from '../store/useGarageStore'
import { useMyGarage } from '../store/useMyGarage'
import './JournalPage.scss'

export default function JournalPage() {
  const { cars, entries } = useMyGarage()
  const removeEntry = useGarageStore((state) => state.removeEntry)
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const carFilter = searchParams.get('car') ?? ''

  const carLabels = useMemo(
    () => new Map(cars.map((car) => [car.id, `${car.make} ${car.model}`.trim()])),
    [cars],
  )

  const visible = useMemo(() => {
    const scoped = carFilter ? entries.filter((entry) => entry.carId === carFilter) : entries
    return searchEntries(scoped, query)
  }, [entries, carFilter, query])

  const totals = sumEntries(visible)

  const setCarFilter = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('car', value)
    else next.delete('car')
    setSearchParams(next, { replace: true })
  }

  return (
    <Page
      title="Журнал работ"
      subtitle={`${formatNumber(visible.length)} записей · запчасти ${formatMoney(
        totals.parts,
      )} · работы ${formatMoney(totals.work)}`}
      actions={
        <Link className="btn btn-primary" to="/new">
          Новая запись
        </Link>
      }
    >
      <section className="panel">
        <div className="toolbar">
          <label className="field toolbar-search">
            <span className="field-label">Поиск по журналу</span>
            <input
              className="field-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="работа, СТО, адрес, артикул, аналог, описание…"
            />
          </label>

          <label className="field toolbar-car">
            <span className="field-label">Автомобиль</span>
            <select
              className="field-select"
              value={carFilter}
              onChange={(event) => setCarFilter(event.target.value)}
            >
              <option value="">Все автомобили</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.make} {car.model}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        {visible.length === 0 ? (
          <p className="empty">
            {entries.length === 0 ? 'Журнал пуст — создайте первую запись' : 'Ничего не найдено'}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Авто</th>
                  <th>Работа</th>
                  <th>СТО и адрес</th>
                  <th className="num">Пробег</th>
                  <th className="num">Запчасти</th>
                  <th className="num">Работы</th>
                  <th className="num">Итого</th>
                  <th className="actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => {
                  const split = entrySplit(entry)
                  const maps = yandexMapsUrl(entry.stationName, entry.stationAddress)
                  const isOpen = expanded === entry.id

                  return (
                    <Fragment key={entry.id}>
                      <tr>
                        <td className="nowrap">{formatDate(entry.date)}</td>
                        <td className="nowrap">{carLabels.get(entry.carId) ?? '—'}</td>
                        <td>
                          <button
                            className="link"
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : entry.id)}
                          >
                            {entry.title}
                          </button>
                          {entry.parts.length > 0 && (
                            <span className="tag parts-tag">
                              {formatNumber(entry.parts.length)} з/ч
                            </span>
                          )}
                          {entry.note && <p className="note">{entry.note}</p>}
                        </td>
                        <td>
                          {entry.stationName || '—'}
                          {entry.stationAddress && (
                            <>
                              <br />
                              <span className="muted">{entry.stationAddress}</span>
                            </>
                          )}
                          {maps && (
                            <>
                              <br />
                              <a
                                className="link"
                                href={maps}
                                target="_blank"
                                rel="noreferrer noopener"
                              >
                                Яндекс Карты
                              </a>
                            </>
                          )}
                        </td>
                        <td className="num">{formatNumber(entry.mileage)}</td>
                        <td className="num">{formatMoney(split.parts)}</td>
                        <td className="num">{formatMoney(split.work)}</td>
                        <td className="num strong">{formatMoney(split.total)}</td>
                        <td className="actions">
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Удалить запись «${entry.title}»?`)) {
                                removeEntry(entry.id)
                              }
                            }}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>

                      {isOpen && entry.parts.length > 0 && (
                        <tr className="parts-row">
                          <td colSpan={9}>
                            <div className="table-wrap">
                              <table className="table table-parts">
                                <thead>
                                  <tr>
                                    <th>Запчасть</th>
                                    <th>Артикул</th>
                                    <th>Аналоги</th>
                                    <th className="num">Кол-во</th>
                                    <th className="num">Цена</th>
                                    <th className="num">Сумма</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entry.parts.map((part) => (
                                    <tr key={part.id}>
                                      <td>{part.name || '—'}</td>
                                      <td>{part.article || '—'}</td>
                                      <td>{part.analog || '—'}</td>
                                      <td className="num">{formatNumber(part.quantity)}</td>
                                      <td className="num">{formatMoney(part.unitPrice)}</td>
                                      <td className="num">
                                        {formatMoney(part.quantity * part.unitPrice)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="parts-total">
                              Пробег на момент работ: {formatMileage(entry.mileage)}
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={5}>Итого по выборке</th>
                  <th className="num">{formatMoney(totals.parts)}</th>
                  <th className="num">{formatMoney(totals.work)}</th>
                  <th className="num strong">{formatMoney(totals.total)}</th>
                  <th />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </Page>
  )
}
