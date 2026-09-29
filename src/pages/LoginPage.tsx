import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { AUTH_ERRORS, useAuthStore } from '../auth/authStore'
import './LoginPage.scss'

type Mode = 'login' | 'register'

type LoginLocationState = { from?: { pathname: string } }

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const error = useAuthStore((state) => state.error)
  const pending = useAuthStore((state) => state.pending)
  const signIn = useAuthStore((state) => state.login)
  const signUp = useAuthStore((state) => state.register)
  const clearError = useAuthStore((state) => state.clearError)

  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLFormElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = (location.state as LoginLocationState | null)?.from?.pathname ?? '/'

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-card > *', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
      })
      gsap.from('.auth-orb', {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
      })
      gsap.to('.auth-orb', {
        yPercent: 220,
        xPercent: -60,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 6,
      })
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!error) return
    gsap.fromTo(card.current, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)' })
  }, [error])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const success =
      mode === 'login' ? await signIn(login, password) : await signUp(login, password)

    if (success) navigate(redirectTo, { replace: true })
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setPassword('')
    clearError()
  }

  return (
    <div className="auth-page" ref={root}>
      <div className="auth-orb" />

      <form className="auth-card" ref={card} onSubmit={handleSubmit} noValidate>
        <h1 className="auth-title">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
          <span className="auth-subtitle">Car Service Book</span>
        </h1>

        <label className="field">
          <span className="field-label">Логин</span>
          <input
            className="field-input"
            type="text"
            name="login"
            autoComplete="username"
            autoFocus
            value={login}
            onChange={(event) => {
              setLogin(event.target.value)
              if (error) clearError()
            }}
          />
        </label>

        <label className="field">
          <span className="field-label">Пароль</span>
          <input
            className="field-input"
            type="password"
            name="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) clearError()
            }}
          />
        </label>

        {error && (
          <p className="alert" role="alert">
            {AUTH_ERRORS[error]}
          </p>
        )}

        <button className="submit" type="submit" disabled={pending}>
          {pending ? 'Проверяем...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>

        <p className="switch">
          {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            className="link"
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </form>
    </div>
  )
}
