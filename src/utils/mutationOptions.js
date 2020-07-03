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
  const data = proxy.readQuery({ query: FIND_TODOS });
  const items = data.findTodos.items.map(item => {
    if (item.id === updateTodo.id) return updateTodo;
    return item;
  });
  proxy.writeQuery({ 
    query: FIND_TODOS,
    data: {
      findTodos: {
        ...data.findTodos,
        items,
      },
    }
  })
};

export const deleteTodoUpdateQuery = (proxy, { data: { deleteTodo }}) => {
  const data = proxy.readQuery({ query: FIND_TODOS });
  const items = data.findTodos.items.filter(item => item.id !== deleteTodo.id);
  proxy.writeQuery({ 
    query: FIND_TODOS,
    data: {
      findTodos: {
        ...data.findTodos,
        items,
      },
    }
  })
};