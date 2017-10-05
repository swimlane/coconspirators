import { NAME_KEY, QueueOptions } from './types';

export function Queue(props: QueueOptions) {
  return function(target: any) {
    Reflect.defineMetadata(NAME_KEY, props, target.prototype);
  };
}
