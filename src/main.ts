import {setFailed, setOutput} from '@actions/core'
import {cp, mkdirP, mv} from '@actions/io/'
import {exists} from '@actions/io/lib/io-util'

import {getVars, Vars} from './lib/getVars'
import {isErrorLike} from './lib/isErrorLike'
import log from './lib/log'
import {rmRF} from '@actions/io';

async function cache(vars: Vars) {
  const {cachePath, targetDir, targetPath, options} = vars;
  if (await exists(cachePath)) {
    await mkdirP(targetDir);

    switch (options.strategy) {
      case 'copy-immutable':
      case 'copy':
        await cp(cachePath, targetPath, {
          copySourceDirectory: false,
          recursive: true,
        })
        break
      case 'move':
        await mv(cachePath, targetPath, {force: true});
        break
    }

    log.info(`Cache found and restored to ${options.path} with ${options.strategy} strategy`);
    setOutput('cache-hit', true)
  } else {
    log.info(`Skipping: cache not found for ${options.path}.`);
    setOutput('cache-hit', false)
  }
}

async function clean(vars: Vars) {
  await rmRF(vars.cacheDir)
}

async function main(): Promise<void> {
  try {
    const vars = getVars();
    switch (vars.options.mode) {
      case "cache":
        return cache(vars);
      case "clean":
        return clean(vars);
    }
  } catch (error: unknown) {
    console.trace(error)
    setFailed(isErrorLike(error) ? error.message : `unknown error: ${error}`)
  }
}

void main()
