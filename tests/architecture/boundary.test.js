import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

function getFilesRecursively(dir, extensions) {
  let results = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, extensions))
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(fullPath)
      }
    }
  }
  return results
}

describe('Architectural Boundary Guard: Client / Server Isolation', () => {
  const srcDir = path.resolve(process.cwd(), 'frontend', 'src')
  const clientFiles = getFilesRecursively(srcDir, ['.js', '.jsx'])

  it('ensures frontend/src/ contains client files', () => {
    expect(clientFiles.length).toBeGreaterThan(0)
  })

  it('forbids browser frontend/src/ files from importing backend/, server/ or api/ modules', () => {
    const forbiddenImports = []
    const forbiddenPatterns = [
      /from\s+['"][^'"]*\/backend(\/|['"])/,
      /from\s+['"][^'"]*\/server(\/|['"])/,
      /from\s+['"][^'"]*\/api(\/|['"])/,
      /import\s*\(['"][^'"]*\/backend(\/|['"])/,
      /import\s*\(['"][^'"]*\/server(\/|['"])/,
      /import\s*\(['"][^'"]*\/api(\/|['"])/,
      /require\s*\(['"][^'"]*\/backend(\/|['"])/,
      /require\s*\(['"][^'"]*\/server(\/|['"])/,
      /require\s*\(['"][^'"]*\/api(\/|['"])/,
    ]

    for (const filePath of clientFiles) {
      const content = fs.readFileSync(filePath, 'utf8')
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          forbiddenImports.push({
            file: path.relative(process.cwd(), filePath),
            matchedPattern: pattern.toString(),
          })
        }
      }
    }

    expect(
      forbiddenImports,
      `Client boundary violation: src/ files must NEVER import server/ or api/ modules! Found:\n${JSON.stringify(
        forbiddenImports,
        null,
        2
      )}`
    ).toEqual([])
  })

  it('forbids browser src/ files from importing node:* built-in modules', () => {
    const forbiddenNodeImports = []
    const nodeBuiltinPattern = /from\s+['"]node:/

    for (const filePath of clientFiles) {
      const content = fs.readFileSync(filePath, 'utf8')
      if (nodeBuiltinPattern.test(content)) {
        forbiddenNodeImports.push(path.relative(process.cwd(), filePath))
      }
    }

    expect(
      forbiddenNodeImports,
      `Client boundary violation: src/ files must NEVER import node:* modules! Found:\n${forbiddenNodeImports.join(
        ', '
      )}`
    ).toEqual([])
  })
})
