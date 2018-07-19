import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  it('returns a generator function', () => {
    const getState = jest.fn();
    const dispatch = jest.fn();

    const description: any = {
      key: 'test-state-machine',
    };
    const result = createStateMachineSaga(description);
    expect(result({ getState, dispatch })).toMatchInlineSnapshot(`
Object {
  "next": [Function],
  "return": [Function],
  "throw": [Function],
  Symbol(Symbol.iterator): [Function],
}
`);
  });
});
