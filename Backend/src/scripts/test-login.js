import { login } from '../services/authService.js'

async function run() {
  const email = 'adagas'
  const password = 'senhadaorademais'

  try {
    const user = await login(email, password)
    console.log('LOGIN SUCCESS', user)
    process.exit(0)
  } catch (err) {
    console.error('LOGIN FAILED', err.message)
    process.exit(1)
  }
}

run()
