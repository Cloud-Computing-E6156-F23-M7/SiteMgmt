import React from 'react';
import AdminComponent from './components/AdminComponent';
import FeedbackComponent from './components/FeedbackComponent';
import ActionComponent from './components/ActionComponent';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 className="App-header"> Site Management Dashboard</h1>
      <AdminComponent />
      <FeedbackComponent />
      <ActionComponent />
    </div>
  );
}

export default App;
