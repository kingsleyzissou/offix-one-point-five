import React, { useContext } from 'react';
import { QuickForm, BoolField } from 'uniforms-antd';
import { Card, Button } from 'antd';

import { schema } from '../../schema';
import { UPDATE_TODO, DELETE_TODO, FIND_TODOS } from '../../gql/queries';
import { OfflineContext } from "../../config/client.apollo";

export function TodoItem({ todo }) {

  const { scheduler } = useContext(OfflineContext);

  const handleToggle = () => {
    scheduler.execute({
      query: UPDATE_TODO,
      variables: { ...todo, completed: !todo.completed },
      refetchQueries: [{ query: FIND_TODOS }]
    }).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
    );
  };

  const handleDelete =  () => {
    scheduler.execute({
      query: DELETE_TODO,
      variables: { id: todo.id },
      refetchQueries: [{ query: FIND_TODOS }]
    }).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
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