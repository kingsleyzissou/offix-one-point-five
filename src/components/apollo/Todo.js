import React, { useContext } from 'react';
import { AutoForm, TextField, SubmitField, ErrorsField, HiddenField } from 'uniforms-antd';
import { useQuery } from '@apollo/client';

import { OfflineContext } from '../../config/client.apollo';
import { schema } from '../../schema';
import { FIND_TODOS, CREATE_TODO } from '../../gql/queries';
import { TodoList } from './TodoList';
import { Loading } from '../Loading';
import { Error } from '../Error';

export function Todo() {

  const offix = useContext(OfflineContext);

  const { data, error, loading } = useQuery(FIND_TODOS, {
    fetchPolicy: 'no-cache'
  });

  const handleSubmit = async (model) => {
    try {
      await offix.execute({
        query: CREATE_TODO,
        variables: model,
        refetchQueries: [{ query: FIND_TODOS }]
      });
      model.title = '';
    } catch (err) {
      if (err.offline) {
        const result = await err.watchOfflineChange();
        console.log(result);
      }
    }
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
        <HiddenField name="version" value={1} />
        <SubmitField style={{ float: 'right' }}>Add</SubmitField>
      </AutoForm>
      <br />
      <br />
      <TodoList todos={data.findAllTodos} />
    </div>
  );
};