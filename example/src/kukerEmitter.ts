import { BaseEmitter } from 'kuker-emitters';
import * as stringHash from 'string-hash';

const colors = [
  '#bae1ff',
  '#baffc9 ',
  '#ffffba',
  '#ffdfba',
  '#ffb3ba',
  '#e6d5ff',
  '#ffd1d6',
  '#a5ffcf',
  '#ffe6ef',
  '#bfff7b',
];

const toColor = (key: string): string => {
  const index = Math.round(stringHash(key) / 429496729.5);
  return colors[index];
};

const kukerEmit = BaseEmitter();
const typeToIconMap: { [index: string]: string } = {
  STATE_MACHINE_START: 'fa-play-circle',
  STATE_MACHINE_INITIAL_STATE: 'fa-archive',
  STATE_MACHINE_LISTENING: 'fa-ellipsis-h',
  STATE_MACHINE_RECEIVED: 'fa-arrow-left',
  STATE_MACHINE_NO_TRANSITION: 'fa-ban',
  STATE_MACHINE_NEW_STATE: 'fa-archive',
  STATE_MACHINE_START_ACTIVITY: 'fa-play',
  STATE_MACHINE_STOP_ACTIVITY: 'fa-stop',
  STATE_MACHINE_ACTION: 'fa-circle',
};

export const emit = (emitted: any) => {
  kukerEmit({
    ...emitted,
    icon: typeToIconMap[emitted.type],
    color: toColor(emitted.key),
  });
};
