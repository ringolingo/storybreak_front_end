import React from 'react';
import PropTypes from 'prop-types';
import './IndexCard.css'

const IndexCard = ({id, logline, location, showCard}) => {

    const popOutCard = () => {
        showCard({id: id, logline: logline, location: location});
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