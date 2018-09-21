import { render } from 'state-machine-cat';
import { MachineConfig } from 'xstate/lib/types';

export const xstateToSvg = (description: MachineConfig) => {
  const smcDescription = xstateToSmcDescription(description);

  // console.log(JSON.stringify(smcDescription, null, 2));

  const svg = render(smcDescription, {
    inputType: 'json',
    outputType: 'svg',
  });

  return svg;
};

const xstateToSmcDescription = (
  description: any,
  parent: string | null = null,
) => {
  const states: any = [];
  const transitions: any = [];
  const prefix = parent === null ? '' : parent + '.';

  if (description.initial) {
    states.push({
      name: prefix + 'initial',
      type: 'initial',
    });
    transitions.push({
      from: prefix + 'initial',
      to: prefix + description.initial,
    });
  }

  Object.keys(description.states).forEach((stateName) => {
    const state = description.states[stateName];
    Object.keys(state.on || {}).forEach((eventName) => {
      const transition = state.on[eventName];

      if (typeof transition === 'string') {
        transitions.push({
          from: prefix + stateName,
          to: prefix + transition,
          event: eventName,
          label: eventName,
        });
      } else if (Array.isArray(transition)) {
        transition.forEach((transitionOption) => {
          const smcTransition: any = {
            from: prefix + stateName,
            to: prefix + transitionOption.target,
            event: eventName,
          };
          let label = eventName;

          if (transitionOption.cond) {
            const cond =
              typeof transitionOption.cond === 'function'
                ? transitionOption.cond.name
                : transitionOption.cond;

            smcTransition.cond = cond;
            label = label + ` [${cond}]`;
          }
          if (transitionOption.actions && transitionOption.actions.length > 0) {
            const actionsText = transitionOption.actions
              .map(
                (action: any) =>
                  typeof action === 'function' ? action.name : action,
              )
              .join(', ');
            smcTransition.action = actionsText;
            label = label + `/${actionsText}`;
          }
          smcTransition.label = label;
          transitions.push(smcTransition);
        });
      }
    });

    const smcState: any = {
      name: prefix + stateName,
      type: 'regular',
      label: stateName,
    };

    const triggers = [];
    if (state.onEntry) {
      triggers.push({
        type: 'entry',
        body: state.onEntry.name || state.onEntry.toString(),
      });
    }
    if (state.onExit) {
      triggers.push({
        type: 'exit',
        body: state.onExit.name || state.onExit.toString(),
      });
    }
    if (triggers.length > 0) {
      smcState.triggers = triggers;
      const activities = triggers.map(({ type, body }) => `${type}/${body}`);
      smcState.activities = activities.join('\n');
    }

    if (state.states) {
      smcState.statemachine = xstateToSmcDescription(state, prefix + stateName);
    }

    states.push(smcState);
  });

  const statemachine: any = { states };
  if (transitions.length > 0) {
    statemachine.transitions = transitions;
  }

  if (description.parallel) {
    return {
      states: [
        {
          name: prefix + 'parallel',
          type: 'parallel',
          label: parent === null ? '(machine)' : parent,
          statemachine,
        },
      ],
    };
  }

  return statemachine;
};
