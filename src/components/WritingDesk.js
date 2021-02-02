import React, {useState} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier} from 'draft-js';
import './WritingDesk.css';

const WritingDesk = () => {
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );

    const onEditorChange = (editorState) => {
        setEditorState(editorState);
    }

    return (
        <div className="writing-desk__desk container border border-dark rounded w-75 h-75">
            <div className="writing-desk__editor">
                <Editor
                    editorState={editorState}
                    onChange={onEditorChange}
                />
            </div>
        </div>
    )
};

export default WritingDesk;