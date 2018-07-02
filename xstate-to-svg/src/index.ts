import { render } from 'state-machine-cat';

export const xstateToSvg = (description) => {
  const smcDescription: string[] = [];

  Object.keys(description.states).forEach((stateName) => {
    const state = description.states[stateName];
    Object.keys(state.on).forEach((eventName) => {
      const transition = state.on[eventName];

      if (typeof transition === 'string') {
        smcDescription.push(`${stateName} => ${transition} : ${eventName};`);
      } else if (Array.isArray(transition)) {
        transition.forEach((transitionOption) => {
          smcDescription.push(
            `${stateName} => ${transitionOption.target} : ${eventName};`,
          );
        });
      }
    });
  });

  const smcString = smcDescription.join('\n');

  console.log('smcString\n', smcString);

  const svg = render(smcString, {
    outputType: 'svg',
  });

  console.log('svg', svg);
  return svg;
};
