// The effect only needs the injected Three namespace; it owns all rendering.
declare module 'three' {
	const THREE: Record<string, unknown>
	export = THREE
}

declare module 'vanta/dist/vanta.net.min' {
	export interface VantaEffect {
		destroy(): void
		renderer?: { dispose(): void; forceContextLoss(): void }
	}
	export default function NET(options: {
		el: HTMLElement
		THREE: unknown
		mouseControls: boolean
		touchControls: boolean
		gyroControls: boolean
		color: number
		backgroundColor: number
		points: number
		spacing: number
		maxDistance: number
		showDots: boolean
		scale: number
		speed: number
	}): VantaEffect
}
