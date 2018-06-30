import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  it('returns a generator function', () => {
    const description = {
      key: 'test-state-machine',
    };
    const result = createStateMachineSaga(description);
    expect(result()).toMatchSnapshot();
  });
});
