import React, { useState } from 'react';
import AdminComponent from './components/AdminComponent';
import AdminTableComponent from './components/AdminTableComponent';
import FeedbackComponent from './components/FeedbackComponent';
import FeedbackTableComponent from './components/FeedbackTableComponent';
import ActionComponent from './components/ActionComponent';
import './App.css';

function App() {
  const [activeComponent, setActiveComponent] = useState("admin");
  const [isAdminActive, setAdminActive] = useState("true");
  const [isFeedbackActive, setFeedbackActive] = useState("false");
  const [isActionsActive, setActionsActive] = useState("false");

  const toggleClass = (tab) => {
    if (tab == "admin") {
      setAdminActive(true);
      setFeedbackActive(false);
      setActionsActive(false);
    } else if (tab == "feedback") {
      setAdminActive(false);
      setFeedbackActive(true);
      setActionsActive(false);
    } else if (tab == "action") {
      setAdminActive(false);
      setFeedbackActive(false);
      setActionsActive(true);
    }
   };

  return (
    <div className="App">
      <nav class="navbar p-3 rounded shadow-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand mb-0 h1" href="#">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Columbia_University_Shield.svg" width="30" height="24"></img>
              Columbia Malaria Visualizer
          </a>

          <ul class="nav nav-pills justify-content-end">
            <li class="nav-item">
              <a class="nav-link">Map</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link">Login</a>
            </li>
          </ul>
        </div>
      </nav>
      <br></br>

      <div class="card">
        <div class="card-header">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a class={isAdminActive ? "nav-link active" : "nav-link"} onClick={() => {setActiveComponent('admin'); toggleClass("admin")}}>Admins</a>
            </li>
            <li class="nav-item">
              <a class={isFeedbackActive ? "nav-link active" : "nav-link"} onClick={() => {setActiveComponent('feedback'); toggleClass("feedback")}}>Feedbacks</a>
            </li>
            <li class="nav-item">
              <a class={isActionsActive ? "nav-link active" : "nav-link"} onClick={() => {setActiveComponent('action'); toggleClass("action")}}>Actions</a>
            </li>
          </ul>
        </div>
        <div class="card-body">
          {activeComponent === 'admin' && <AdminComponent />}
          {activeComponent === 'feedback' && <FeedbackComponent />}
          {activeComponent === 'action' && <ActionComponent />}
        </div>
      </div>

      <br></br>
      <div class="card">
        <div class="card-body">
          {activeComponent === 'admin' && <AdminTableComponent />}
          {activeComponent === 'feedback' && <FeedbackTableComponent />}
        </div>
      </div>

    </div>
  );
}

export default App;

