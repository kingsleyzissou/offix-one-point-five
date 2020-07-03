import React, { useContext } from 'react';
import { QuickForm, BoolField } from 'uniforms-antd';
import { Card, Button } from 'antd';

import { schema } from '../../schema';
import { UPDATE_TODO, DELETE_TODO, FIND_TODOS } from '../../gql/queries';
import { OfflineContext } from "../../config/client.apollo";
import { getOptimisticResponse } from '../../utils/CreateOptimisticResponse';


export function TodoItem({ todo }) {

  const { scheduler } = useContext(OfflineContext);

  const handleToggle = () => {
    const variables = { ...todo, completed: !todo.completed };
    scheduler.execute({
      query: UPDATE_TODO,
      variables,
      optimisticResponse: getOptimisticResponse(variables, UPDATE_TODO),
      update: (proxy, { data: { updateTodo }}) => {
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
      }
    }).subscribe(
      (res) => console.log('update sub', res),
      (err) => console.log('update error', err)
    );
  };

  const handleDelete =  () => {
    const variables = { id: todo.id };
    scheduler.execute({
      query: DELETE_TODO,
      variables,
      optimisticResponse: getOptimisticResponse(variables, DELETE_TODO),
      update: (proxy, { data: { deleteTodo }}) => {
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
      }
    }).subscribe(
      (res) => console.log('delete sub', res),
      (err) => console.log('delete', err)
    );
  };

  return (
    <Card style={{ marginBottom: '0.5em' }}>
      <QuickForm schema={schema} >
        <BoolField
          label={todo.title}
          value={todo.completed}
          name="completed"
          onChange={handleToggle}
        />
      </QuickForm>
      <span>id: {todo.id}</span>
      <Button
        style={{ float: 'right', marginTop: '0.5em' }}
        onClick={handleDelete}
        type="danger"
      >
        Delete
      </Button>
    </Card>
  );
}