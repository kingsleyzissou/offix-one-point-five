import React, { useContext } from 'react';
import { useMutation } from 'urql';
import { QuickForm, BoolField } from 'uniforms-antd';
import { Card, Button } from 'antd';

import { OfflineContext } from '../../config/client.urql';
import { schema } from '../../schema';
import { UPDATE_TODO, DELETE_TODO } from '../../gql/queries';

export function TodoItem({ todo }) {
  const offix = useContext(OfflineContext);

  const handleToggle = async () => {
    try {
      await offix.execute({
        query: UPDATE_TODO,
        variables: {
          id: todo.id,
          completed: !todo.completed
        }
      });
    } catch (err) {
      // console.log(err)
      if (err.offline) {
        const result = await err.watchOfflineChange();
        console.log(result);
      }
    }
  };

  const handleDelete = async (model) => {
    try {
      await offix.execute({
        query: DELETE_TODO,
        variables: { id: todo.id }
      });
    } catch (err) {
      if (err.offline) {
        const result = await err.watchOfflineChange();
        console.log(result);
      }
    }
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