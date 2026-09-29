import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useAuthStore } from '../auth/authStore'
import './Layout.scss'

const LINKS = [
  { to: '/', label: 'Мои авто', end: true },
  { to: '/journal', label: 'Журнал', end: false },
  { to: '/stats', label: 'Статистика', end: false },
  { to: '/new', label: 'Новая запись', end: false },
]

export default function Layout() {
  const root = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const currentUser = useAuthStore((state) =>
    state.users.find((user) => user.id === state.currentUserId),
  )
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nav-link', { y: -16, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="shell" ref={root}>
      <header className="shell-header">
        <span className="brand">Car Service Book</span>
        <nav className="nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="shell-user">
          <span className="user">{currentUser?.login}</span>
          <button className="btn btn-sm" type="button" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <main className="shell-main" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  )
}
