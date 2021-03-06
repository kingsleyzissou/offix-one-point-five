import React from 'react';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

// import { Todo as URQLTodo } from './components/urql/Todo';
import { Todo as ApolloTodo } from './components/apollo/Todo';

function App() {
  return (
    <div style={containerStyle}>
      {/*<URQLTodo />*/}
      <ApolloTodo />
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100vw',
  padding: '2em 0'
}

export default App;
