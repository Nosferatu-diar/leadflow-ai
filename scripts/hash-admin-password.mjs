import { hash, truncates } from 'bcryptjs'

function hiddenPrompt(prompt) {
	return new Promise((resolve, reject) => {
		if (!process.stdin.isTTY) return reject(new Error('Run this command in an interactive terminal.'))
		let value = ''
		process.stdout.write(prompt)
		process.stdin.setEncoding('utf8')
		process.stdin.setRawMode(true)
		process.stdin.resume()
		function finish() {
			process.stdin.off('data', onData)
			process.stdout.write('\n')
		}
		function onData(chunk) {
			for (const character of chunk) {
				if (character === '\u0003' || character === '\u0004') { finish(); reject(new Error('Cancelled.')); return }
				if (character === '\r' || character === '\n') { finish(); resolve(value); return }
				if (character === '\u007f' || character === '\b') value = Array.from(value).slice(0, -1).join('')
				else if (character >= ' ' && value.length < 256) value += character
			}
		}
		process.stdin.on('data', onData)
	})
}

try {
	const password = await hiddenPrompt('New admin password (input hidden): ')
	if (password.length < 12 || truncates(password)) throw new Error('Choose at least 12 characters and at most 72 UTF-8 bytes.')
	const confirmation = await hiddenPrompt('Confirm password (input hidden): ')
	if (password !== confirmation) throw new Error('Passwords do not match.')
	console.log(`ADMIN_PASSWORD_HASH='${await hash(password, 12)}'`)
} catch (error) {
	console.error(error instanceof Error ? error.message : 'Unable to generate password hash.')
	process.exitCode = 1
} finally {
	if (process.stdin.isTTY) {
		process.stdin.pause()
		process.stdin.setRawMode(false)
	}
}
