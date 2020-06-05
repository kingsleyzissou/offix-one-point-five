import React from 'react';

import { TodoItem } from './TodoItem';

export function TodoList({ todos }) {
  if (todos && todos.length === 0 ) return <div>No items</div>;

  return (
    todos && todos.length > 0 && (
      todos.map((todo,index) => {
        return <TodoItem key={index} todo={todo} />
      })
    )
  );
}