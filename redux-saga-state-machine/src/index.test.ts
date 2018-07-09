import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  it('returns a generator function', () => {
    const description = {
      key: 'test-state-machine',
    };
    const result = createStateMachineSaga(description);
    expect(result()).toMatchInlineSnapshot(`
Object {
  "next": [Function],
  "return": [Function],
  "throw": [Function],
  Symbol(Symbol.iterator): [Function],
}
`);
  });
});
