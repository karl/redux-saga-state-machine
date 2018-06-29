import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  it('returns a generator function', () => {
    const description = {};
    const result = createStateMachineSaga(description);
    expect(result).toEqual();
  });
});
