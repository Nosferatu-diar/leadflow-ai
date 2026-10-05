'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function Reveal({ children }: { children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const element = ref.current
		if (!element || !('IntersectionObserver' in window)) return
		const media = matchMedia('(prefers-reduced-motion: reduce)')
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				element.dataset.reveal = 'visible'
				observer.unobserve(element)
			}
		}, { threshold: 0, rootMargin: '0px 0px -40px 0px' })
		const show = () => {
			if (media.matches) {
				element.dataset.reveal = 'visible'
				observer.disconnect()
			}
		}
		// Server-rendered content stays visible without JavaScript. Only sections
		// below the fold are hidden after mount, avoiding an initial text flash.
		if (!media.matches && element.getBoundingClientRect().top >= innerHeight) {
			element.dataset.reveal = 'waiting'
			observer.observe(element)
		}
		media.addEventListener('change', show)
		return () => { observer.disconnect(); media.removeEventListener('change', show) }
	}, [])
	return <div ref={ref} className='section-reveal'>{children}</div>
}
