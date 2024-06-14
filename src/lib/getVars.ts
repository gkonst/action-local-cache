import path from 'path'

import * as core from '@actions/core'

const { GITHUB_REPOSITORY, RUNNER_TOOL_CACHE } = process.env
const CWD = process.cwd()

export const STRATEGIES = ['copy-immutable', 'copy', 'move'] as const
export type Strategy = typeof STRATEGIES[number]

export const MODES = ['cache', 'clean'] as const
export type Mode = typeof MODES[number]

export type Vars = {
  cacheDir: string
  cachePath: string
  options: {
    key: string
    path: string,
    strategy: Strategy,
    mode: Mode
  }
  targetDir: string
  targetPath: string
}

export const getVars = (): Vars => {
  if (!RUNNER_TOOL_CACHE) {
    throw new TypeError('Expected RUNNER_TOOL_CACHE environment variable to be defined.')
  }

  if (!GITHUB_REPOSITORY) {
    throw new TypeError('Expected GITHUB_REPOSITORY environment variable to be defined.')
  }

  const options = {
    key: core.getInput('key') || 'no-key',
    path: core.getInput('path'),
    strategy: core.getInput('strategy') as Strategy,
    mode: core.getInput('mode') as Mode
  }

  if (!options.path) {
    throw new TypeError('path is required but was not provided.')
  }

  if (!Object.values(STRATEGIES).includes(options.strategy)) {
    throw new TypeError(`Unknown strategy ${options.strategy}`)
  }

  if (!Object.values(MODES).includes(options.mode)) {
    throw new TypeError(`Unknown mode ${options.mode}`)
  }

  const cacheDir = path.join(RUNNER_TOOL_CACHE, GITHUB_REPOSITORY, options.key)
  const cachePath = path.join(cacheDir, options.path)
  const targetPath = path.resolve(CWD, options.path)
  const { dir: targetDir } = path.parse(targetPath)

  return {
    cacheDir,
    cachePath,
    options,
    targetDir,
    targetPath,
  }
}
