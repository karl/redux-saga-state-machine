import { render } from 'state-machine-cat';

export const xstateToSvg = (description: any) => {
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
            smcTransition.cond = transitionOption.cond;
            label = label + ` [${transitionOption.cond}]`;
          }
          if (transitionOption.action) {
            smcTransition.action = transitionOption.action;
            label = label + `/${transitionOption.action}`;
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
