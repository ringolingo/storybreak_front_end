import React, {useState, useEffect} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier, moveSelectionToEnd, genKey, ContentBlock, ContentState, List, getBlockMap, getKey, toOrderedMap} from 'draft-js';
// import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import Corkboard from './components/Corkboard';
import './App.css';


function App() {
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );
  const [allStories, setAllStories] = useState([]);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [currentStoryTitle, setCurrentStoryTitle] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [amendedTitle, setAmendedTitle] = useState('');
  const [inBoardView, setInBoardView] = useState(false);
  // TODO do I need two separate title setting modals?
  const [showNewTitleModal, setShowNewTitleModal] = useState(false);
  const [showNewSceneModal, setShowNewSceneModal] = useState(false);
  const [newSceneSummary, setNewSceneSummary] = useState('');
  const [newEntityKey, setNewEntityKey] = useState('');


  // app gets and remembers all stories
  useEffect(() => {
    getStories();
  }, []);

  useEffect(() => {
    getCurrentStory(currentStoryId);
  }, [inBoardView]);

  const getStories = () => {
    axios
      .get("/api/stories/")
      .then(response => setAllStories(response.data))
      .catch(error => console.log(error));
  }


  // app gets and remembers user's choice for current story
  // and sets it up in the editor state
  const selectStory = (event) => {
    setCurrentStoryId(event.target.id);
    setCurrentStoryTitle(event.target.title);
    getCurrentStory(event.target.id);
  };

  const getCurrentStory = (story) => {
    axios
    .get(`/api/stories/${story}`)
    .then(response => {
      loadWork(response.data.draft_raw)
    })
    .catch(error => console.log(error.response.data))
  }

  const loadWork = (rawJson) => {
    const destringed = JSON.parse(rawJson);
    const newContentState = convertFromRaw(destringed);
    const newEditor = EditorState.createWithContent(newContentState);
    setEditorState(newEditor);
  }


  // app lets user pick a different story or start a new story
  const unselectStory = () => {
    setCurrentStoryId(null);
    setCurrentStoryTitle('');
  }

  const changeStory = () => {
    return (
      <div>
        <button className="btn btn-block story-list__title-change" onClick={unselectStory}>Currently on {currentStoryTitle} - Choose A Different Story</button>
      </div>
    )
  }

   // TODO can I streamline this so there's just one modal for changing/making new title?
   // ALSO TODO: updating the title saves it in the DB but doesn't trigger rerender so change doesn't show
  const openNewTitle = () => {
    setShowNewTitleModal(true);
  }

  const closeNewTitle = () => {
    setShowNewTitleModal(false);
  }

  const newTitleInProgress = (event) => {
    setAmendedTitle(event.target.value);
  }

  const newTitleModal = () => {
    return (
        <Modal show={showNewTitleModal} onHide={closeNewTitle} animation={false} backdrop='static' centered={true} >    
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>What do you want the title of your story to be?</Form.Label>
                        <Form.Control as='textarea' value={amendedTitle} onChange={newTitleInProgress} />
                    </Form.Group>
                </Form>
            </Modal.Body>
        
            <Modal.Footer>
                <Button variant="primary" onClick={createNew}>
                    Set Title
                </Button>
            </Modal.Footer>
        </Modal>
    )
  }

  // TODO update this to have the proper draft_raw content
  // ...if any draft_raw, for that matter
  // use editorstate get current content - raww - stingify?
  // ALSO TODO have the new work spawn one scene immediately to start with
  const createNew = () => {
    if (amendedTitle === '') {
      closeNewTitle();
      return
    }

    axios
      .post('/api/stories/', {title: amendedTitle, draft_raw: "I need to be updated with real content! :D"})
      .then(response => {
        setCurrentStoryId(response.data.data.id)
        setCurrentStoryTitle(response.data.data.title)
        const expandedStories = [...allStories]
        expandedStories.push(response.data.data);
        setAllStories(expandedStories);
      })
      .catch(error => console.log(error));

    closeNewTitle();
    setAmendedTitle('');
  }


  // app creates story links and shows them to user for user to pick
  const generateTitles = allStories.map((story, i) => {
    return <button className="btn story-list__title" key={i} id={story.id} onClick={selectStory} title={story.title}>
        {story.title}
    </button>
  });

  const noStorySelectedView = () => {
    return (
      <div className="story-list">
        <h3 className="story-list__header">What would you like to work on today?</h3>
          {generateTitles}
          <button className="btn story-list__title btn-primary" onClick={openNewTitle}>Start A New Story (this button not yet operational)</button>
      </div>
    )
  }


  // TODO App lets you delete a work?
  // should be a fairly simple delete request to api/stories/{id}
  // ...for ease of use, call on currentStoryId
  // so deletion to be done from the writing desk view


  // app updates state and database according to the user's work
  const onEditorChange = (editorState) => {
    setEditorState(editorState);
    // console.log(convertToRaw(editorState.getCurrentContent()));
  };

  const saveWork = (title) => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    const updatedWork = {
        title: title,
        draft_raw: JSON.stringify(raw),
    }

    console.log(JSON.stringify(raw))
    console.log(allStories[0]['last_updated'])
    axios
        .put(`/api/stories/${currentStoryId}/`, updatedWork)
        .then(response => console.log(response.data))
        .catch(error => console.log(error.response.data));
  };

  const saveExistingWork = () => {
    saveWork(currentStoryTitle)
  }


  // writer can create new scenes from either view
  const addScene = () => {
    // create new content block for scene break
    const splitEditorState = splitLine();
    const currentContent = splitEditorState.getCurrentContent();
    const selection = splitEditorState.getSelection();
    
    // create the entity with the scene break id
    const sceneBreakId = Math.random().toString(36).substring(2,10);
    currentContent.createEntity('SCENE', 'IMMUTABLE', sceneBreakId);
    const entityKey = currentContent.getLastCreatedEntityKey();
    
    // get a summary for the new scene and post to the api
    setNewEntityKey(sceneBreakId);
    openNewScene();
    
    // create the content block the entity will be associated with
    const textToUse = '***' + sceneBreakId + '***'
    const textWithEntity = Modifier.insertText(currentContent, selection, textToUse, null, entityKey);
    const updatedEditorState = EditorState.push(splitEditorState, textWithEntity, 'insert-characters')
    setEditorState(updatedEditorState);
    
    // create new content block for user's next input
    splitLine(updatedEditorState);
    
    // save the work with its new content blocks to the database
    saveWork(currentStoryTitle);
  };

  const splitLine = (es=editorState) => {
    // function makes sure that the new scene break is made on its own separate content block
    // not attached to a preexisting content block, not attached to the next thing the user writes
    const currentContent = es.getCurrentContent();
    const selection = es.getSelection();
    const newLine = Modifier.splitBlock(currentContent, selection)
    const editorWithBreak = EditorState.push(es, newLine, "split-block")
    setEditorState(editorWithBreak)
    return editorWithBreak
  }

  
  const openNewScene = () => {
    setNewSceneSummary('');
    setShowNewSceneModal(true);
  }

  const closeNewScene = () => {
    setShowNewSceneModal(false);
  }

  const newSceneInProgress = (event) => {
    setNewSceneSummary(event.target.value);
  }

  const saveSceneSummary = () => {
    const newScene = {
      card_summary: newSceneSummary,
      location: null,
      story: currentStoryId,
      entity_key: newEntityKey
    }

    axios
      .post("/api/scenes/", newScene)
      .then(response => console.log(response.data))
      .catch(error => console.log(error.response.data))

    closeNewScene();
  }

  const newSceneModal = () => {
    return (
        <Modal show={showNewSceneModal} onHide={closeNewScene} animation={false} backdrop='static' centered={true} >    
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>What's a quick summary of what happens in this scene?</Form.Label>
                        <Form.Control as='textarea' value={newSceneSummary} onChange={newSceneInProgress} />
                    </Form.Group>
                </Form>
            </Modal.Body>
        
            <Modal.Footer>
                <Button variant="primary" onClick={saveSceneSummary}>
                    Make New Scene
                </Button>
            </Modal.Footer>
        </Modal>
    )
  }


  // app lets user change story title
  const openTitleChange = () => {
    setShowTitleModal(true);
  }

  const closeTitleModal = () => {
    setShowTitleModal(false);
    setAmendedTitle('');
  }

  const titleChangeInProgress = (event) => {
    setAmendedTitle(event.target.value);
  }

  // this makes it so new title shows up as desired on the button at top
  // but old title still shows in list of all works until refresh
  const saveTitleChange = () => {
    saveWork(amendedTitle);
    setCurrentStoryTitle(amendedTitle);
    const storiesPlusUpdate = allStories.map((story) => {
      if (story.id == currentStoryId) {
        const updatedStory = {...story}
        story.title = amendedTitle;
        return updatedStory;
      } else {
        return story
      }
    })
    setAllStories(storiesPlusUpdate);
    closeTitleModal();
  }

  const changeTitleModal = () => {
    return (
        <Modal show={showTitleModal} onHide={closeTitleModal} animation={false} backdrop='static' centered={true} >    
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>New Title</Form.Label>
                        <Form.Control as='textarea' value={amendedTitle} onChange={titleChangeInProgress} />
                    </Form.Group>
                </Form>
            </Modal.Body>
        
            <Modal.Footer>
                <Button variant="secondary" onClick={closeTitleModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={saveTitleChange}>
                    Save New Title
                </Button>
            </Modal.Footer>
        </Modal>
    )
  }


  // lets user switch between views
  const goToStoryBoard = () => {
    // set cursor to end (selection to end/focus to end/w/e? so that scenes inserted in card view go to end)
    saveWork(currentStoryTitle)
    setInBoardView(true);
  }

  const goToWritingDesk = () => {
    setInBoardView(false);
  }


  // app displays the story the user wants to work on
  // either as a writing desk
  // or by rendering the corkboard component
  const storyInProgressView = () => {
      if (inBoardView) {
        return (
          <Corkboard currentStoryId={currentStoryId} backToDesk={goToWritingDesk} addSceneCallback={addScene} />
        )
      } else {
        return (
          <div className="writing-desk__desk">
            
            {/* {changeStory()} */}
            <button className="btn btn-block story-list__title-change" onClick={goToStoryBoard}>Go To Story Board</button>
            
            <div className="writing-desk__editor container border border-dark rounded w-75 h-75">
              <Editor
                editorState={editorState}
                onChange={onEditorChange}
                spellCheck={true}
              />
            </div>
    
            <div className="writing-desk__button-bar d-flex flex-row justify-content-center">
                <button onClick={saveExistingWork} className="btn btn-primary rounded m-1">Save</button>
                <button onClick={addScene} className="btn btn-secondary rounded m-1">Add New Scene</button>
                <button onClick={openTitleChange} className="btn btn-secondary rounded m-1">Change Title</button>
            </div>
    
            {changeTitleModal()}
            </div>
        )
      }
  }

  return (
    <div>
      {currentStoryId ? changeStory() : null }
      {currentStoryId ? storyInProgressView() : noStorySelectedView()}
      {newTitleModal()}
      {newSceneModal()}
    </div>
  );
}

export default App;