import { BaseEmitter } from 'kuker-emitters';
import { toColor } from './toColor';

const kukerEmit = BaseEmitter();
const typeToIconMap = {
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

export const emit = (emitted) => {
  kukerEmit({
    ...emitted,
    icon: typeToIconMap[emitted.type],
    color: toColor(emitted.key),
  });
};
