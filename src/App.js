import React, {useState, useEffect} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier} from 'draft-js';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
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
  const [showNewTitleModal, setShowNewTitleModal] = useState(false);


  // app gets and remembers all stories
  useEffect(() => {
    getStories();
  }, []);

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

    axios
      .get(`/api/stories/${event.target.id}`)
      .then(response => loadWork(response.data.draft_raw))
      .catch(error => console.log(error.response))
  };

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
  const openNewTitle = () => {
    console.log('createnew passed to opennewtitle')
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
  // ALSO TODO have the new work spawn one scene immediately to start with
  const createNew = () => {
    if (amendedTitle === '') {
      closeNewTitle();
      return
    }

    axios
      .post('/api/stories/', {title: amendedTitle, draft_raw: "I need to be updated with real content! :D"})
      .then(response => {
        setCurrentStoryId(response.data.id)
        setCurrentStoryTitle(response.data.title)
        const expandedStories = [...allStories]
        expandedStories.push(response.data);
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


  // app updates state and database according to the user's work
  const onEditorChange = (editorState) => {
    setEditorState(editorState);
  };

  const saveWork = (title) => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    const updatedWork = {
        title: title,
        draft_raw: JSON.stringify(raw),
    }

    axios
        .put(`/api/stories/${currentStoryId}/`, updatedWork)
        .then(response => console.log(response.data))
        .catch(error => console.log(error.response));
  };

  const saveExistingWork = () => {
    saveWork(currentStoryTitle)
  }

  // update this to also get & save a card summary
  // maybe even have that also be added into the body of the text?
  // after the textwithentity do another round of insertText
  // fields needed to send with post request - entity_key (by which I actually mean sceneBreakId not entityKey, nice naming choices),
  // content_blocks (send at this point, or wait for that to be updated on a save?),
  // card_summary (if procured), location (for now just figure out with it being last), and story (currentStoryId)
  const addScene = () => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const sceneBreakId = Math.random().toString(36).substring(2,10);
    const newEntity = currentContent.createEntity('SCENE', 'IMMUTABLE', sceneBreakId);
    const entityKey = currentContent.getLastCreatedEntityKey();

    const textToUse = '***' + sceneBreakId + '***'
    const textWithEntity = Modifier.insertText(currentContent, selection, textToUse, null, entityKey);

    const updatedEditorState = EditorState.push(editorState, textWithEntity, 'insert-characters')
    setEditorState(updatedEditorState);
  };


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

  const saveTitleChange = () => {
    saveWork(amendedTitle);
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
          <Corkboard currentStoryId={currentStoryId} backToDesk={goToWritingDesk} />
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
    </div>
  );
}

export default App;