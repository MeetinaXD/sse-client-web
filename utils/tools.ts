type UsePromiseReturnType<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

export function usePromise<T>(): UsePromiseReturnType<T> {
  let _resolve: UsePromiseReturnType<T>['resolve'];
  let _reject: UsePromiseReturnType<T>['reject'];

  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  return { promise, resolve: _resolve!, reject: _reject! }
}

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
