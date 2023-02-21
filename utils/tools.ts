type UsePromiseReturnType<T> = {
  promise: Promise<T>
  resolve: (value?: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

export function usePromise<T>(): UsePromiseReturnType<T> {
  let _resolve;
  let _reject;

  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  return { promise, resolve: _resolve, reject: _reject }
}

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export function forIn(target: object, iteratee: Function) {
  Object.keys(target).forEach((key) => iteratee(target[key], key, target))
}
