import traverse from 'traverse';

import { FIND_TODOS } from "../gql/queries";

export const createTodoUpdateQuery = (proxy, { data: { createTodo }}) => {
  const data = proxy.readQuery({ query: FIND_TODOS });
  proxy.writeQuery({ 
    query: FIND_TODOS,
    data: {
      findTodos: {
        ...data.findTodos,
        items: [
          ...data.findTodos.items,
          createTodo
        ]
      },
    }
  })
};

export const updateTodoUpdateQuery = (proxy, { data: { updateTodo }}) => {
  const cached = proxy.readQuery({ query: FIND_TODOS });
  // eslint-disable-next-line
  const data = traverse(cached).map(function(item) {
    // function required to preserve `this` keyword
    if (item.id === updateTodo.id) this.update(updateTodo);
  });

  proxy.writeQuery({ 
    query: FIND_TODOS,
    data
  })
};

export const deleteTodoUpdateQuery = (proxy, { data: { deleteTodo }}) => {
  const cached = proxy.readQuery({ query: FIND_TODOS });
  // eslint-disable-next-line
  const data = traverse(cached).map(function(item) {
    // function required to preserve `this` keyword
    if (item.id === deleteTodo.id) this.remove();
  });
  proxy.writeQuery({ 
    query: FIND_TODOS,
    data
  })
};