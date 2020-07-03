import gql from 'graphql-tag';

export const FIND_TODOS = gql`
  query {
    findTodos {
      items {
        id
        title
        completed
      }
    }
  }
`;

export const CREATE_TODO = gql`
  mutation createTodo($title: String!, $completed: Boolean) {
    createTodo(input: {title: $title, completed: $completed}) {
      id
      title
      completed
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation updateTodo($id: ID!, $completed: Boolean) {
    updateTodo(input: {id: $id, completed: $completed}) {
      id
      title
      completed
    }
  }
`;

export const DELETE_TODO = gql`
  mutation deleteTodo($id: ID!) {
    deleteTodo(input: {id: $id}) {
      id
    }
  }
`;

export const NEW_TODO = gql`
  subscription newTodo {
    newTodo {
      id
      title
      description
      completed
    }
  } 
`;