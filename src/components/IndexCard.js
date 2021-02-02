import React from 'react';
import PropTypes from 'prop-types';
import IndexCardEditForm from './IndexCardEditForm';
import './IndexCard.css'

const IndexCard = ({id, logline}) => {

    // need a callback function?
    // double clicking pulls up a modal form
    // submitting calls the callback function
    // which updates the logline in that card in state in corkboard
    // (b/c state is updated, the card's 'logline' display will be updated too)

    // HM okay I think I might need to set the modal up from the corkboard element
    // but then am I passing info back and forth and back and forth?
    // corkboard to index card to make the card, index card to corkboard to select,
    // corkboard to ??? to pop out the modal, modal to form for editing, form to corkboard for updating start
    const popOutCard = () => {
        
    };

    return (
        <div onDoubleClick={popOutCard} className="card">
            <div className="card-body">
                <p>{logline}</p>
            </div>
        </div>
    )
};

IndexCard.propTypes = {
    logline: PropTypes.string,
    id: PropTypes.number,
};

export default IndexCard;