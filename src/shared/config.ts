import * as config from '../.config.json'

interface ConfigData {
  mqtt: {
    url: string
  }
}

export class Config {
  private config

  private static instance: Config

  static get(): Config
  static get<T extends keyof ConfigData>(scope: T): ConfigData[T]
  static get(scope?: keyof ConfigData) {
    this.instance = this.instance || new Config()
    if (scope) {
      return this.instance.getScope(scope)
    }
    return this.instance
  }

  constructor() {
    this.config = config
  }

  getScope<T extends keyof ConfigData>(scope: T): ConfigData[T] {
    return this.config[scope]
  }
}