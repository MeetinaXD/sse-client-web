import { vi, expect, afterAll, beforeAll, it, MockInstance } from 'vitest'
import supertest from 'supertest'

import { server, send } from './server'

import { SSEClient } from '../lib/index'
import ES from 'eventsource'
import { AddressInfo } from 'net'
import { sleep, usePromise } from '../utils/tools'

vi.stubGlobal('EventSource', ES)
/**
 * waiting for mock function be called once
 * ! After this function finished, mock instance's call count will be reset to 0
 */
const waitForCallOnce = async (fn: MockInstance, afterHook?: () => any, beforeRestore?: () => any) => {
  const { promise, resolve } = usePromise()

  const rawFn = fn.getMockImplementation()
  fn.mockImplementationOnce(async (...args) => {
    await rawFn?.call(undefined, args)
    resolve('')
    try {
      await beforeRestore?.()
    } finally {
      fn.mockRestore()
    }
  })

  await afterHook?.()
  return promise
}

beforeAll(async () => {
  await server.listen()
})

it('with a running server', async () => {
  const response = await supertest(server)
    .get('/get')
    .expect('OK')
    .expect(200)
})

it('with subscribe', async () => {
  const { port } = server.address() as AddressInfo

  let spy = vi.fn()

  const es = new SSEClient()
  const subscriber = es.subscribe(`http://127.0.0.1:${port}/trigger`).on('message', spy)
  await subscriber.waitUntilOpened()

  await waitForCallOnce(spy,
    () => send('trigger1'),
    () => {
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith('trigger1')
    }
  )

  await waitForCallOnce(spy,
    () => send('trigger2'),
    () => {
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith('trigger2')
    }
  )

  es.unsubscribe(`http://127.0.0.1:${port}/trigger`)
})


afterAll(async () => {
  await server.close()
})