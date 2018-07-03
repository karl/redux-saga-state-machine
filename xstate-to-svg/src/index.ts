import { render } from 'state-machine-cat';

export const xstateToSvg = (description) => {
  const smcDescription = xstateToSmcDescription(description);
  const smcString = smcDescriptionToString(smcDescription);

  // console.log(smcString);

  const svg = render(smcString, {
    outputType: 'svg',
  });

  return svg;
};

const xstateToSmcDescription = (description, root = true) => {
  const smcDescription: any = [];

  if (description.initial && root) {
    smcDescription.push({ from: 'initial', to: description.initial });
  }

  Object.keys(description.states).forEach((stateName) => {
    const state = description.states[stateName];
    Object.keys(state.on || {}).forEach((eventName) => {
      const transition = state.on[eventName];

      if (typeof transition === 'string') {
        smcDescription.push({
          from: stateName,
          to: transition,
          event: eventName,
        });
      } else if (Array.isArray(transition)) {
        transition.forEach((transitionOption) => {
          smcDescription.push({
            from: stateName,
            to: transitionOption.target,
            event: eventName,
          });
        });
      }
    });

    if (state.states) {
      const subDescription = xstateToSmcDescription(state, false);
      smcDescription.unshift({
        state: stateName,
        description: subDescription,
      });
    }
  });

  return smcDescription;
};

const smcDescriptionToString = (smcDescription, indent = 0) => {
  return smcDescription
    .map((node) => {
      if (node.state) {
        return `"${node.state}" {
${smcDescriptionToString(node.description, indent + 2)}
};`;
      }

      const eventString = node.event ? ': "' + node.event + '"' : '';
      return `${' '.repeat(indent)}"${node.from}" => "${
        node.to
      }"${eventString};`;
    })
    .join('\n');
};
