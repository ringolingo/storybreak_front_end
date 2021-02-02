import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import WritingDesk from './components/WritingDesk';
import './App.css';

function App() {
  return (
    <div>
      <Router>
        <div>
          {/* can I add a ternary or something (maybe function?) so this only displays
          for the writing desk or corkboard view and not if logged out or on story list */}
          <nav>
            <ul>
              <li>
                <Link to='/desk'>Writing Desk</Link>
              </li>
            </ul>
          </nav>

          <Switch>
            <Route path='/desk'>
              <WritingDesk />
            </Route>
          </Switch>
        </div>
      </Router>

      <p>footer placeholder</p>
    </div>
  );
}

export default App;
