import { render } from 'state-machine-cat';

export const xstateToSvg = (description) => {
  const smcDescription: Array<{ from: string; to: string; event: string }> = [];

  Object.keys(description.states).forEach((stateName) => {
    const state = description.states[stateName];
    Object.keys(state.on).forEach((eventName) => {
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
  });

  const smcString = smcDescription
    .map(({ from, to, event }) => {
      return `${from} => ${to} : ${event};`;
    })
    .join('\n');

  console.log('smcString\n', smcString);

  const svg = render(smcString, {
    outputType: 'svg',
  });

  console.log('svg', svg);
  return svg;
};
