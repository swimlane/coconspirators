import { NAME_KEY, QueueOptions, ExchangeOptions } from './types';

/**
 * Denotes a queue and registers QueueOptions against it
 *
 * @export
 * @param {QueueOptions} props
 * @returns
 */
export function Queue(props: QueueOptions) {
  return function(target: any) {
    Reflect.defineMetadata(NAME_KEY, props, target.prototype);
  };
}

/**
 * Denotes an exchange and registers ExchangeOptions against it
 *
 * @export
 * @param {EchangeOptions} props
 * @returns
 */
export function Exchange(props: ExchangeOptions) {
  return function(target: any) {
    Reflect.defineMetadata(NAME_KEY, props, target.prototype);
  };
}
