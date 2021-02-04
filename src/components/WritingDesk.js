import React, {useState, useEffect} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier} from 'draft-js';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './WritingDesk.css';

const WritingDesk = ({selectedStoryId, selectedStoryTitle, refreshStories}) => {
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );
    // added these in attempt to make title change work
    const [currentStoryId, setCurrentStoryId] = useState(selectedStoryId);
    const [currentStoryTitle, setCurrentStoryTitle] = useState(selectedStoryTitle);
    const [showModal, setShowModal] = useState(false);
    const [amendedTitle, setAmendedTitle] = useState('');


    useEffect(() => {
        if (selectedStoryId) {
            axios
                .get(`/api/stories/${selectedStoryId}`)
                .then(response => loadWork(response.data.draft_raw))
                .catch(error => console.log(error.response))
        } else {
            // createNew
        }
    }, []);

    const onEditorChange = (editorState) => {
        setEditorState(editorState);
    };

    const createNew = () => {
        // addScene();
        // ask for title
        // (if response empty, return and leave function)
        // (else)
        // post to /api/stories/
        // from response, fish out the ID
        // set this title and ID as current title and ID
    }

    const saveWork = (title) => {
        // get current content state, convert to raw, convert to JSON
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        const updatedWork = {
            title: title,
            draft_raw: JSON.stringify(raw),
        }

        // send updated work to server
        axios
            .put(`/api/stories/${currentStoryId}/`, updatedWork)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response));
    };

    const saveExistingWork = () => {
        saveWork(currentStoryTitle)
    }

    const loadWork = (rawJson) => {
        const destringed = JSON.parse(rawJson);
        const newContentState = convertFromRaw(destringed);
        const newEditor = EditorState.createWithContent(newContentState);
        setEditorState(newEditor);
    }

    const addScene = () => {
        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();

        const sceneBreakId = Math.ceil(Math.random()*10000);
        const newEntity = currentContent.createEntity('SCENE', 'IMMUTABLE', sceneBreakId);
        const entityKey = currentContent.getLastCreatedEntityKey();

        const textToUse = '***' + sceneBreakId + '***'
        const textWithEntity = Modifier.insertText(currentContent, selection, textToUse, null, entityKey);

        const updatedEditorState = EditorState.push(editorState, textWithEntity, 'insert-characters')
        setEditorState(updatedEditorState);
    };

    const openTitleChange = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        setAmendedTitle('');
    }

    const titleChangeInProgress = (event) => {
        setAmendedTitle(event.target.value);
    }

    // problem - this updates it in database but app & writing desk show old title
    // until page is refreshed
    const saveTitleChange = () => {
        saveWork(amendedTitle);
        closeModal();
        refreshStories();
    }

    const changeTitleModal = () => {
        return (
            <Modal show={showModal} onHide={closeModal} animation={false} backdrop='static' centered={true} >    
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>New Title</Form.Label>
                            <Form.Control as='textarea' value={amendedTitle} onChange={titleChangeInProgress} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={saveTitleChange}>
                        Save New Title
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <div className="writing-desk__desk">
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
};

export default WritingDesk;