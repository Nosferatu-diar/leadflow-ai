const paths = {
	collect: 'M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2M8 3h8v4H8zM8 12h8M8 16h5',
	validation: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6zM8 12l3 3 5-6',
	dashboard: 'M3 3h18v18H3zM3 8h18M14 8v13M6 5.5h.01M9 5.5h.01',
	telegram: 'm3 10 18-7-7 18-3-8-8-3zM11 13 21 3',
	ai: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3zM20 2v4M18 4h4',
	status: 'M15 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM8 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM22 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM8 5a9 9 0 0 0-5 9M16 5a9 9 0 0 1 5 9M9 21h6',
	agencies: 'M3 21h18M5 21V5h10v16M15 11h4v10M8 8h4M8 12h4M8 16h4',
	restaurants: 'M4 3v6a3 3 0 0 0 6 0V3M7 3v18M17 3c-3 3-3 8 1 8h1M19 3v18',
	education: 'm2 8 10-5 10 5-10 5L2 8zM6 10v6c4 3 8 3 12 0v-6M22 8v7',
	businesses: 'M9 6V3h6v3M3 6h18v15H3zM3 11l9 4 9-4M10 13h4v4h-4z',
	freelancers: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21v-2a8 8 0 0 1 16 0v2',
	teams: 'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6 21v-3a6 6 0 0 1 12 0v3M3 9a3 3 0 0 1 3-3M21 9a3 3 0 0 0-3-3M2 19v-2a4 4 0 0 1 3-4M22 19v-2a4 4 0 0 0-3-4',
	arrow: 'M5 12h14m-5-5 5 5-5 5',
}

export function ProductIcon({ kind, className = 'size-6' }: { kind: keyof typeof paths; className?: string }) {
	return (
		<svg aria-hidden='true' focusable='false' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className={className}>
			<path d={paths[kind]} />
		</svg>
	)
}
