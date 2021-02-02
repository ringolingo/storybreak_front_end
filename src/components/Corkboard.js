import React, {useState, useEffect} from 'react';
import IndexCard from './IndexCard';
import './Corkboard.css';

const placeholderCards = [
    {
        id: 1,
        logline: 'it was a dark and stormy night',
    },
    {
        id: 2,
        logline: 'there was a boy named Eustance Clarence Scrubb, and he almost deserved it',
    },
    {
        id: 3,
        logline: 'it was love at first sight',
    },
    {
        id: 4,
        logline: 'it is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife'
    }
]

const Corkboard = () => {
    const [cards, setCards] = useState(placeholderCards);

    const cardComponents = cards.map((card) => {
        return (
            <IndexCard logline={card.logline} key={card.id}/>
        )
    });

    // TODO refactor to connect with backend
    const addCard = () => {
        const expandedCards = [...cards];
        expandedCards.push(<IndexCard logline='' key={cards.length + 1} />);
        setCards(expandedCards);
    };

    return (
        <div className="corkboard__wall">
            <div className="corkboard__frame rounded p-5 d-flex justify-content-center align-items-center">
                <div className="corkboard__board d-flex flex-wrap justify-content-center p-2">{cardComponents}</div>
            </div>

            <div className="corkboard__button-bar d-flex justify-content-center">
                <button onClick={addCard} className="btn btn-medium btn-primary">Add New Card</button>
            </div>
        </div>
    )
};

export default Corkboard;