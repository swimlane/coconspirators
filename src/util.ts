/**
 * This will let you resolve a promise externally.
 * This is somewhat a hack and should only be used
 * for specific reasons.
 *
 * This is used to create a promise for the connection
 * so that when the connect is called it can be resolved
 * externally by that fn when its happens.
 *
 * Ref: http://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/
 */
export function defer<T>(): ExternalDeferPromise<T> {
  let res;
  let rej;

  const promise: ExternalDeferPromise<T> = new Promise<T>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;
  return promise;
}

export interface ExternalDeferPromise<T> extends Promise<T> {
  resolve?: (value?: {} | PromiseLike<{}>) => void;
  reject?: (reason?: any) => void;
}
