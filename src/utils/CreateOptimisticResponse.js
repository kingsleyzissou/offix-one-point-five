import { resultKeyNameFromField } from '@apollo/client/utilities';

export const getOptimisticResponse = (variables, mutation) => {
  return createOptimisticResponse({
    variables,
    mutation,
    returnType: 'Todo'
  })
}

export function createOptimisticResponse(options) {
  const operation = getOperationFieldName(options.mutation);

  const {
    returnType,
    variables,
    idField = "id",
  } = options;

  return {
    __type: "Mutation",
    [operation]: {
      __typename: returnType,
      ...variables,
      [idField]: variables.id ? variables.id : generateClientId(),
      optimisticResponse: true
    }
  }
}

export const getOperationFieldName = (operation) => resultKeyNameFromField(
  operation.definitions[0].selectionSet.selections[0]
);

export const generateClientId = (length = 8) => {
  let result = 'client:';
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};