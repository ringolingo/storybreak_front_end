import React from 'react';
import PropTypes from 'prop-types';
import './IndexCard.css'

const IndexCard = ({card, showCard}) => {

    const popOutCard = () => {
        showCard(card);
    };

    return (
        <div onDoubleClick={popOutCard} className="card">
            <div className="card-body">
                <p>{card.card_summary}</p>
            </div>
        </div>
    )
};

IndexCard.propTypes = {
    card: PropTypes.shape({
        card_summary: PropTypes.string,
        id: PropTypes.number,
        location: PropTypes.number,
        content_blocks: PropTypes.array,
        story: PropTypes.number,
        entity_key: PropTypes.string,
    }),
    showCard: PropTypes.func,
};

export default IndexCard;