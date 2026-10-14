import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envLocal = path.resolve(__dirname, '.env.local')
const env = path.resolve(__dirname, '.env')

if (typeof process.loadEnvFile === 'function') {
  if (fs.existsSync(envLocal)) {
    try { process.loadEnvFile(envLocal) } catch {}
  }
  if (fs.existsSync(env)) {
    try { process.loadEnvFile(env) } catch {}
  }
}
