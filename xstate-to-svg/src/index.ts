import { render } from 'state-machine-cat';

export const xstateToSvg = (description) => {
  const smcDescription = xstateToSmcDescription(description);
  const smcString = smcDescriptionToString(smcDescription);

  console.log(smcString);

  const svg = render(smcString, {
    outputType: 'svg',
  });

  return svg;
};

const xstateToSmcDescription = (description, prefix = '') => {
  const stateDescriptions: any = [];
  const transitions: any = [];

  if (description.initial && prefix === '') {
    transitions.push({ from: 'initial', to: description.initial });
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
        });
      } else if (Array.isArray(transition)) {
        transition.forEach((transitionOption) => {
          transitions.push({
            from: prefix + stateName,
            to: prefix + transitionOption.target,
            event: eventName,
          });
        });
      }
    });

    let subDescription: any = null;
    if (state.states) {
      subDescription = xstateToSmcDescription(state, stateName + '.');
    }

    stateDescriptions.unshift({
      state: prefix + stateName,
      label: stateName,
      description: subDescription,
    });
  });

  if (description.parallel) {
    return {
      stateDescriptions: [
        {
          state: prefix + 'parallel',
          label: prefix || '(machine)',
          description: { stateDescriptions, transitions },
        },
      ],
      transitions: [],
    };
  }

  return { stateDescriptions, transitions };
};

const smcDescriptionToString = (smcDescription, indent = 0) => {
  let result = '';

  if (smcDescription.stateDescriptions.length > 0) {
    result =
      smcDescription.stateDescriptions
        .map((node) => {
          const labelPart = ` [label="${node.label}"]`;
          const descriptionPart = node.description
            ? ` {
${smcDescriptionToString(node.description, indent + 2)}
${' '.repeat(indent)}}`
            : '';
          return `${' '.repeat(indent)}"${
            node.state
          }"${labelPart}${descriptionPart}`;
        })
        .join(',\n') + ';\n';
  }

  if (
    smcDescription.stateDescriptions.length > 0 &&
    smcDescription.transitions.length > 0
  ) {
    result = result + '\n';
  }

  if (smcDescription.transitions.length > 0) {
    result =
      result +
      smcDescription.transitions
        .map((transition) => {
          const eventString = transition.event
            ? ': "' + transition.event + '"'
            : '';
          return `${' '.repeat(indent)}"${transition.from}" => "${
            transition.to
          }"${eventString};`;
        })
        .join('\n');
  }

  return result;
};
