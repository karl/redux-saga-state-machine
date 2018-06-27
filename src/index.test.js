import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  it('returns a saga', () => {
    const description = {
      states: {
        green: {},
        yellow: {},
        red: {},
      },
    };
    const saga = createStateMachineSaga(description);
    expect(saga).toEqual();
  });
});
