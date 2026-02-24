import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

// src/lib/__tests__ is 3 levels inside the repo root
const repoRoot = join(import.meta.dirname, '../../..')

describe('Test infrastructure', () => {
  it('should have a passing test', () => {
    expect(true).toBe(true)
  })

  it('supabase/migrations/ directory exists', () => {
    expect(existsSync(join(repoRoot, 'supabase/migrations'))).toBe(true)
  })

  it('supabase/config.toml exists', () => {
    expect(existsSync(join(repoRoot, 'supabase/config.toml'))).toBe(true)
  })

  it('vitest.config.ts exists', () => {
    expect(existsSync(join(repoRoot, 'vitest.config.ts'))).toBe(true)
  })
})
