import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import WritingDesk from './components/WritingDesk';
import Corkboard from './components/Corkboard';
import StoryStats from './components/StoryStats';

import './App.css';

function App() {
  const [allStories, setAllStories] = useState([]);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [currentStoryTitle, setCurrentStoryTitle] = useState('');

  useEffect(() => {
    getStories();
  }, []);

  const getStories = () => {
    // update index method on backend so get all request just returns title, id, last_updated
    // but get individual still returns everything?

    axios
      .get("/api/stories/")
      .then(response => setAllStories(response.data))
      .catch(error => console.log(error));
  }

  const updateOneStory = (story) => {
    // define a callback method so changing a story title in writing desk
    // tells App to update state 
    // and current story button will reflect new title
  }

  const selectStory = (event) => {
    setCurrentStoryId(event.target.id);
    setCurrentStoryTitle(event.target.title);
  };

  const generateTitles = allStories.map((story, i) => {
    return <button className="btn story-list__title" key={i} id={story.id} onClick={selectStory} title={story.title}>
        {story.title}
    </button>
  });

  const storyTitles = () => {
    return (
      <div className="story-list">
        <h3 className="story-list__header">What would you like to work on today?</h3>
          {generateTitles}
      </div>
    )
  }

  const unselectStory = () => {
    setCurrentStoryId(null);
    setCurrentStoryTitle('');
  }

  const changeStory = () => {
    return (
      <div>
        <Link to='/' className="btn btn-block story-list__title-change" onClick={unselectStory}>Currently on {currentStoryTitle} - Choose A Different Story</Link>
      </div>
    )
  }

  
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
            <Link to='/'>Home</Link>
            <Link to='/desk'>Writing Desk</Link>
            <Link to='/corkboard'>Corkboard</Link>
            <Link to='/stats'>Story Stats</Link>
          </nav>

          {currentStoryTitle ? changeStory() : storyTitles()}

          <Switch>
            <Route path='/desk' render={() => (
              <WritingDesk selectedStoryId={currentStoryId} selectedStoryTitle={currentStoryTitle} refreshStories={updateOneStory}/>
            )} />

            <Route path='/corkboard' render={() => (
              <Corkboard currentStoryId={currentStoryId}/>
            )} />

            <Route path='/stats' component={StoryStats} />
          </Switch>
        </div>
      </Router>

      <p>footer placeholder</p>
    </div>
  );
}

export default App;
