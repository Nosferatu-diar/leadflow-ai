'use client'

import { useEffect, useRef } from 'react'
import type { VantaEffect } from 'vanta/dist/vanta.net.min'

export function HeroNetwork() {
	const hostRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const hero = hostRef.current?.parentElement
		const navbar = document.querySelector('header')
		if (!hero || !navbar) return
		const measure = () => {
			hero.style.setProperty('--navbar-height', `${navbar.getBoundingClientRect().height}px`)
		}
		measure()
		// Follow wrapping, font loading and responsive changes without fixed heights.
		const observer = new ResizeObserver(measure)
		observer.observe(navbar, { box: 'border-box' })
		return () => { observer.disconnect(); hero.style.removeProperty('--navbar-height') }
	}, [])

	useEffect(() => {
		const host = hostRef.current
		if (!host) return
		const media = matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
		let effect: VantaEffect | null = null
		let alive = true
		let visible = false
		let pending = false
		let unavailable = false
		let generation = 0

		function destroy() {
			const renderer = effect?.renderer
			try {
				effect?.destroy()
			} finally {
				// Vanta cancels its frame/listeners; also release the WebGL context.
				renderer?.dispose()
				renderer?.forceContextLoss()
				effect = null
				host!.replaceChildren()
				host!.dataset.vantaState = 'static'
			}
		}

		function eligible() {
			return alive && media.matches && visible && !document.hidden
		}

		async function synchronize() {
			if (!eligible()) {
				generation++
				destroy()
				return
			}
			if (effect || pending || unavailable) return
			pending = true
			const current = generation
			try {
				const probe = document.createElement('canvas')
				const context = probe.getContext('webgl')
				if (!context) { unavailable = true; return }
				context.getExtension('WEBGL_lose_context')?.loseContext()
				// These large decorative libraries never load on mobile/reduced motion.
				const [THREE, { default: NET }] = await Promise.all([
					import('three'),
					import('vanta/dist/vanta.net.min'),
				])
				if (!eligible() || current !== generation) return
				effect = NET({
					el: host!, THREE,
					mouseControls: true, touchControls: true, gyroControls: false,
					color: 0x3fe8ff, backgroundColor: 0x000000,
					points: 10, spacing: 15, maxDistance: 20,
					showDots: true, scale: 1.5, speed: 0.4,
				})
				if (!host!.querySelector('canvas')) {
					unavailable = true
					destroy()
				} else {
					host!.dataset.vantaState = 'animated'
				}
			} catch {
				// Decoration may fail without affecting navigation or the lead form.
				unavailable = true
				destroy()
			} finally {
				pending = false
				// A visibility change during the import must not leave a stale instance.
				if (eligible() && !effect && !unavailable) void synchronize()
			}
		}

		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting
			void synchronize()
		})
		const onChange = () => { void synchronize() }
		observer.observe(host)
		media.addEventListener('change', onChange)
		document.addEventListener('visibilitychange', onChange)
		return () => {
			alive = false
			generation++
			observer.disconnect()
			media.removeEventListener('change', onChange)
			document.removeEventListener('visibilitychange', onChange)
			destroy()
		}
	}, [])

	return <div ref={hostRef} data-vanta-state='static' aria-hidden='true' className='pointer-events-none absolute inset-0 opacity-80' />
}
