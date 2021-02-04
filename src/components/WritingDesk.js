import React, {useState, useEffect} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier} from 'draft-js';
import axios from 'axios';
import './WritingDesk.css';

const WritingDesk = ({currentStoryId, currentStoryTitle}) => {
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );

    useEffect(() => {
        axios
            .get(`/api/stories/${currentStoryId}`)
            .then(response => loadWork(response.data.draft_raw))
            .catch(error => console.log(error.response))
    }, []);

    const onEditorChange = (editorState) => {
        setEditorState(editorState);
    };

    const saveWork = () => {
        // get current content state, convert to raw, convert to JSON
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        const updatedWork = {
            title: currentStoryTitle,
            draft_raw: JSON.stringify(raw),
        }

        // send updated work to server
        axios
            .put(`/api/stories/${currentStoryId}/`, updatedWork)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response));
    };

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
        setNewSceneBreakId(sceneBreakId);
        const newEntity = currentContent.createEntity('SCENE', 'IMMUTABLE', sceneBreakId);
        const entityKey = currentContent.getLastCreatedEntityKey();

        const textToUse = '***' + sceneBreakId + '***'
        const textWithEntity = Modifier.insertText(currentContent, selection, textToUse, null, entityKey);

        const updatedEditorState = EditorState.push(editorState, textWithEntity, 'insert-characters')
        setEditorState(updatedEditorState);
    };

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
                <button onClick={saveWork} className="btn btn-primary rounded m-1">Save</button>
                <button onClick={addScene} className="btn btn-secondary rounded m-1">Add New Scene</button>
            </div>
        </div>
    )
};

export default WritingDesk;