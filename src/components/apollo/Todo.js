import React, { useContext } from 'react';
import { AutoForm, TextField, SubmitField, ErrorsField, HiddenField } from 'uniforms-antd';
import { useQuery } from '@apollo/client';

import { OfflineContext } from '../../config/client.apollo';
import { schema } from '../../schema';
import { FIND_TODOS, CREATE_TODO } from '../../gql/queries';
import { TodoList } from './TodoList';
import { Loading } from '../Loading';
import { Error } from '../Error';
import { createOptimisticResponse } from '../../utils/CreateOptimisticResponse';

export function Todo() {

  const { scheduler } = useContext(OfflineContext);

  const { data, error, loading } = useQuery(FIND_TODOS);

  const handleSubmit = (model) => {
    const optimisticResponse = createOptimisticResponse({
      variables: model,
      returnType: 'Todo',
      mutation: CREATE_TODO
    });
    scheduler.execute({
      query: CREATE_TODO,
      variables: model,
      updateQueries: [{ query: FIND_TODOS }],
      optimisticResponse,
      update: (proxy, { data: { createTodo }}) => {
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
      }
    }).subscribe(
      (res) => {
        console.log(res);
        model.title = ''
      },
      (err) => console.log(err)
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div style={{ width: '40%' }}>
      <h1>Todo List</h1>
      <AutoForm schema={schema} onSubmit={handleSubmit} style={{ marginBottom: '2em' }}>
        <ErrorsField />
        <TextField name="title" />
        <HiddenField name="completed" value={false} />
        <SubmitField style={{ float: 'right' }}>Add</SubmitField>
      </AutoForm>
      <br />
      <br />
      <TodoList todos={data.findTodos.items} />
    </div>
  );
};