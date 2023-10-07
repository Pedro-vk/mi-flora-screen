export const minMax = (min: number, max: number) => (value: number) => Math.min(max, Math.max(min, value))

export const onExit = (() => {
  process.stdin.resume()

  const onExitFns = []
  const onExitHandler = () => {
    onExitFns.forEach(fn => fn())
    process.exit()
  }

  process.on('exit', () => onExitHandler())

  process.on('SIGINT', () => onExitHandler())

  process.on('SIGUSR1', () => onExitHandler())
  process.on('SIGUSR2', () => onExitHandler())

  process.on('uncaughtException', () => onExitHandler())

  return (exitHandler: () => void) => {
    onExitFns.push(exitHandler)
  }
})()
