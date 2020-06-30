import React from 'react';
import { useMutation } from 'urql';
import { QuickForm, BoolField } from 'uniforms-antd';
import { Card, Button } from 'antd';

import { schema } from '../../schema';
import { UPDATE_TODO, DELETE_TODO } from '../../gql/queries';

export function TodoItem({ todo }) {

  const [,updateTodo] = useMutation(UPDATE_TODO);
  const [,deleteTodo] = useMutation(DELETE_TODO);

  const handleToggle = () => {
    updateTodo({
      id: todo.id,
      completed: !todo.completed,
    });
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
        onClick={() => deleteTodo({ id: todo.id })}
        type="danger"
      >
        Delete
      </Button>
    </Card>
  );
}