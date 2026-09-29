import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './App.css'

function App() {
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.title', { y: -40, opacity: 0, duration: 0.8, ease: 'power3.out' })
      gsap.from('.item', {
        y: 60,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.3,
      })
      gsap.to('.orb', {
        xPercent: 400,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 3,
      })
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const el = card.current
    if (!el) return

    const onEnter = () => gsap.to(el, { scale: 1.1, duration: 0.3, ease: 'power2.out' })
    const onLeave = () => gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' })

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
    }
  }, [])

  return (
    <div className="app" ref={root}>
      <div className="orb" />
      <h1 className="title">Car Service Book</h1>
      <p className="subtitle">React + TypeScript + Vite + GSAP</p>
      <div className="card" ref={card}>
        <ul>
          <li className="item">Личный кабинет авто</li>
          <li className="item">Несколько авто</li>
          <li className="item">Журнал работ</li>
          <li className="item">Напоминания и графики расходов</li>
        </ul>
      </div>
    </div>
  )
}

export default App
