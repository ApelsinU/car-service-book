import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import './Page.scss'

interface PageProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function Page({ title, subtitle, actions, children }: PageProps) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.page-head', { y: -24, opacity: 0, duration: 0.5, ease: 'power3.out' })
      gsap.from('.page-body > *', {
        y: 28,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.12,
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="page" ref={root}>
      <header className="page-head">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </header>
      <div className="page-body">{children}</div>
    </div>
  )
}
