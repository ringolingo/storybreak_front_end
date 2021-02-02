import React, {useState, useEffect} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier} from 'draft-js';
import './WritingDesk.css';

const WritingDesk = () => {
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );

    // TODO 
    // 1. want to make it so cursor loads at: end of work or last updated place
    // 2. update to make axios request and upload saved story
    // (unless new)
    //
    // useEffect(() => {
    //     editorState.focus();
    // }, []);

    const onEditorChange = (editorState) => {
        setEditorState(editorState);
    };

    const saveWork = () => {
        // TODO this seems to work out for just saving in page
        // make sure that when it's actually loading from database it still works

        // get current content state and convert to raw
        const contentState = editorState.getCurrentContent();
        console.log(contentState);
        const raw = convertToRaw(contentState);

        // TODO send raw content state to backend
        // TODO get updated content from backend

        // create new editor state from raw content
        // (to be replaced with content from backend)
        // and save in state
        const updatedContent = convertFromRaw(raw);
        const newEditorFromContent = EditorState.createWithContent(updatedContent);
        setEditorState(newEditorFromContent);
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
                <button className="btn btn-secondary rounded m-1">Add New Scene</button>
            </div>
        </div>
    )
};

export default WritingDesk;