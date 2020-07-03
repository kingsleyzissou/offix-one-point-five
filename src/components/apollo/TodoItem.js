import React, { useContext } from 'react';
import { QuickForm, BoolField } from 'uniforms-antd';
import { Card, Button } from 'antd';

import { schema } from '../../schema';
import { UPDATE_TODO, DELETE_TODO } from '../../gql/queries';
import { OfflineContext } from "../../config/client.apollo";
import { getOptimisticResponse } from '../../utils/CreateOptimisticResponse';
import { updateTodoUpdateQuery, deleteTodoUpdateQuery } from '../../utils/mutationOptions';

const observer = {
  next: (res) => console.log(res),
  error: (err) => console.error(err),
  complete: () => console.log('done'),
};

export function TodoItem({ todo }) {

  const { scheduler } = useContext(OfflineContext);

  const handleToggle = () => {
    const variables = { ...todo, completed: !todo.completed };
    scheduler.execute({
      query: UPDATE_TODO,
      variables,
      optimisticResponse: getOptimisticResponse(variables, UPDATE_TODO),
      update: updateTodoUpdateQuery,
    }).subscribe(observer);
  };

  const handleDelete =  () => {
    const variables = { id: todo.id };
    scheduler.execute({
      query: DELETE_TODO,
      variables,
      optimisticResponse: getOptimisticResponse(variables, DELETE_TODO),
      update: deleteTodoUpdateQuery,
    }).subscribe(observer);
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