export const createActions = (namespace: string) => {
  const createAction = (name: string) => {
    const type = `${namespace}/${name}`;
    const actionCreator = (payload?: any) => {
      return {
        type,
        payload,
      };
    };

    actionCreator.type = type;

    Object.defineProperty(actionCreator, 'name', { value: name });

    return actionCreator;
  };

  return createAction;
};
