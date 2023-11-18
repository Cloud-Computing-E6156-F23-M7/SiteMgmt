import React from 'react';
import AdminComponent from './components/AdminComponent';
import FeedbackComponent from './components/FeedbackComponent';
import ActionComponent from './components/ActionComponent';

function App() {
  return (
    <div>
      <h1>Site Management Dashboard</h1>
      <AdminComponent />
      <FeedbackComponent />
      <ActionComponent />
    </div>
  );
}

export default App;
