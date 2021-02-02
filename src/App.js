import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import WritingDesk from './components/WritingDesk';
import Corkboard from './components/Corkboard';

import './App.css';

function App() {
  return (
    <div>
      <Router>
        <div>
          {/* TODO this only displays on the writing desk or corkboard, not if logged out or on story list 

          App in state remembers what user (if any) is logged in -- what level of app needs to remember which story is active? 
          both writingdesk and corkboard need to know -- so App? then app can also only show this if a story
          is in state and a user is logged in
          
          where are axios requests made from then, App or writingdesk/corkboard? */}
          <nav className="navbar">
              <Link to='/desk'>Writing Desk</Link>
              <Link to='/corkboard'>Corkboard</Link>
          </nav>

          <Switch>
            <Route path='/desk'>
              <WritingDesk />
            </Route>
            <Route path='/corkboard'>
              <Corkboard />
            </Route>
          </Switch>
        </div>
      </Router>

      <p>footer placeholder</p>
    </div>
  );
}

export default App;
