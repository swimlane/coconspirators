import { NAME_KEY, QueueOptions } from './types';

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
