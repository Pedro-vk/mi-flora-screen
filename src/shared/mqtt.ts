import * as mqtt from 'mqtt'
import { Config } from './config'
import { minMax, onExit } from './utils'

export class Mqtt {
  private static instance: Mqtt

  private client
  private initialized: Promise<unknown>
  private subscriptions: {[topic: string]: ((data: any) => void)[]} = {}

  constructor() {
    this.client = mqtt.connect(Config.get('mqtt').url)

    let resolve
    this.initialized = new Promise(_ => resolve = _)

    this.client.on('connect', resolve)

    this.client.on('message', (topic, message) => {
      let data = message.toString()
      try {
        data = JSON.parse(message.toString())
      } catch { }
      this.subscriptions[topic]
        ?.forEach(callback => callback(data))
    })

    onExit(() => this.client.end())
  }

  static getInstance(): Mqtt {
    return this.instance ??= new Mqtt()
  }

  async subscribe<T>(topic: string, callback: (data: T) => void) {
    await this.initialized
    if (!this.subscriptions[topic]) {
      this.client.subscribe(topic)
      this.subscriptions[topic] = []
    }
    this.subscriptions[topic].push(callback)
  }

  publish(topic: string, data: any) {
    this.client.publish(topic, data instanceof Object ? JSON.stringify(data) : data)
  }
}