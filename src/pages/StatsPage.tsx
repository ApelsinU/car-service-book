import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page'
import { formatMoney, formatNumber } from '../lib/format'
import { sumEntries, totalsByCar, totalsByStation, totalsByYear } from '../store/selectors'
import { useMyGarage } from '../store/useMyGarage'
import './StatsPage.scss'

const ALL = ''

function share(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

export default function StatsPage() {
  const { cars, entries } = useMyGarage()
  const [carId, setCarId] = useState(ALL)

  const scoped = useMemo(
    () => (carId ? entries.filter((entry) => entry.carId === carId) : entries),
    [entries, carId],
  )

  const totals = useMemo(() => sumEntries(scoped), [scoped])
  const years = useMemo(() => totalsByYear(scoped), [scoped])
  const byCar = useMemo(() => totalsByCar(entries, cars), [entries, cars])
  const byStation = useMemo(() => totalsByStation(scoped), [scoped])

  const partsShare = share(totals.parts, totals.total)
  const workShare = share(totals.work, totals.total)

  return (
    <Page
      title="Статистика расходов"
      subtitle="Ремонт (запчасти) и работа на СТО — раздельно"
      actions={
        <Link className="btn" to="/journal">
          К журналу
        </Link>
      }
    >
      <section className="panel">
        <label className="field car-picker">
          <span className="field-label">Автомобиль</span>
          <select
            className="field-select"
            value={carId}
            onChange={(event) => setCarId(event.target.value)}
          >
            <option value={ALL}>Все автомобили</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.make} {car.model}
              </option>
            ))}
          </select>
        </label>

        <div className="split">
          <div className="split-bar" role="img" aria-label={`Ремонт ${partsShare}%, работы ${workShare}%`}>
            <div className="split-parts" style={{ width: `${partsShare}%` }} />
            <div className="split-work" style={{ width: `${workShare}%` }} />
          </div>
          <div className="split-legend">
            <div className="legend-item">
              <span className="dot dot-parts" />
              <span>Ремонт (запчасти)</span>
              <strong>{formatMoney(totals.parts)}</strong>
              <span className="legend-share">{partsShare}%</span>
            </div>
            <div className="legend-item">
              <span className="dot dot-work" />
              <span>Работа на СТО</span>
              <strong>{formatMoney(totals.work)}</strong>
              <span className="legend-share">{workShare}%</span>
            </div>
            <div className="legend-item legend-total">
              <span>Итого</span>
              <strong>{formatMoney(totals.total)}</strong>
              <span className="legend-share">{formatNumber(scoped.length)} записей</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2 className="panel-title">По годам</h2>
          {years.length === 0 ? (
            <p className="empty">Нет данных</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Год</th>
                    <th className="num">Ремонт</th>
                    <th className="num">Работа</th>
                    <th className="num">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((row) => (
                    <tr key={row.year}>
                      <td className="nowrap">{row.year}</td>
                      <td className="num">{formatMoney(row.parts)}</td>
                      <td className="num">{formatMoney(row.work)}</td>
                      <td className="num strong">{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2 className="panel-title">По автомобилям</h2>
          {byCar.length === 0 ? (
            <p className="empty">Нет данных</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Авто</th>
                    <th className="num">Ремонт</th>
                    <th className="num">Работа</th>
                    <th className="num">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {byCar.map((row) => (
                    <tr key={row.carId}>
                      <td className="nowrap">{row.label}</td>
                      <td className="num">{formatMoney(row.parts)}</td>
                      <td className="num">{formatMoney(row.work)}</td>
                      <td className="num strong">{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2 className="panel-title">По станциям обслуживания</h2>
          {byStation.length === 0 ? (
            <p className="empty">Нет данных</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>СТО</th>
                    <th className="num">Ремонт</th>
                    <th className="num">Работа</th>
                    <th className="num">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {byStation.map((row) => (
                    <tr key={row.stationName}>
                      <td>
                        {row.stationName}
                        <span className="tag parts-tag">{formatNumber(row.entries)}</span>
                      </td>
                      <td className="num">{formatMoney(row.parts)}</td>
                      <td className="num">{formatMoney(row.work)}</td>
                      <td className="num strong">{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Page>
  )
}
