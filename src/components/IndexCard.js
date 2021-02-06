import React from 'react';
import PropTypes from 'prop-types';
import './IndexCard.css'

const IndexCard = ({id, card_summary, location, showCard}) => {

    const popOutCard = () => {
        console.log('double click registered')
        showCard({id: id, card_summary: card_summary, location: location});
    };

    return (
        <div onDoubleClick={popOutCard} className="card">
            <div className="card-body">
                <p>{card_summary}</p>
            </div>
        </div>
    )
};

IndexCard.propTypes = {
    card_summary: PropTypes.string,
    id: PropTypes.number,
};

export default IndexCard;