import React, {useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import IndexCard from './IndexCard';
import './Corkboard.css';


const placeholderCards = [
    {
        id: 1,
        logline: 'it was a dark and stormy night',
        location: 0,
    },
    {
        id: 2,
        logline: 'there was a boy named Eustace Clarence Scrubb, and he almost deserved it',
        location: 1,
    },
    {
        id: 3,
        logline: 'it was love at first sight',
        location: 2
    },
    {
        id: 4,
        logline: 'it is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife',
        location: 3
    }
]

const Corkboard = ({currentStoryId, backToDesk}) => {
    const [cards, setCards] = useState(placeholderCards);
    const [showModal, setShowModal] = useState(false);
    const [currentCard, setCurrentCard] = useState({
        id: null,
        logline: '',
        location: null,
    });

    const popOutCard = (card) => {
        const selectedCard = {
            id: card.id,
            logline: card.logline,
            location: card.location,
        }
        setCurrentCard(selectedCard);
        setShowModal(true);
    }
    
    const closeModal = () => {
        setShowModal(false);
        setCurrentCard({
            id: null,
            logline: null,
            location: null,
        })
    }

    const cardComponents = cards.map((card, i) => {
        return (
            <IndexCard logline={card.logline} key={card.id} id={card.id} showCard={popOutCard} location={card.location} />
        )
    });

    // TODO refactor to connect with backend
    const addCard = (scene_id = cards.length + 1, summary = '') => {
        const expandedCards = [...cards];
        const newCard = {
            id: scene_id,
            logline: summary,
            location: cards.length
        }
        expandedCards.push(newCard);
        setCards(expandedCards);

        popOutCard(newCard);
    };

    const changeCardSummary = (event) => {
        const updatedCard = {
            id: currentCard.id,
            logline: event.target.value,
            location: currentCard.location,
        };

        setCurrentCard(updatedCard);
    };

    // TODO - refactor to send changes to back end
    const saveCardChanges = () => {
        const updatedCards = [];
        
        cards.forEach((card) => {
            if (card.id === currentCard.id) {
                updatedCards.push(currentCard);
            } else {
                updatedCards.push(card);
            }
        });

        setCards(updatedCards);
        closeModal();
    };

    // TODO refactor to send changes to back end
    const deleteCard = () => {
        const trimmedCards = [];

        cards.forEach((card) => {
            if (card.id !== currentCard.id) {
                trimmedCards.push(card);
            }
        });

        setCards(trimmedCards);
        closeModal();
    }

    const moveCard = (mod) => {
        if ((currentCard.location + mod >= cards.length) || (currentCard.location + mod < 0)) {
            closeModal();
            return;
        }
        
        const shuffleCards = cards;

        shuffleCards.splice(currentCard.location, 1)
        shuffleCards.splice(currentCard.location + mod, 0, currentCard)

        const updateLocations = shuffleCards.map((card, index) => {
            const updateCard = {...card};
            updateCard.location = index;
            return updateCard;
        });
        setCards(updateLocations);

        const movedCard = {...currentCard};
        movedCard.location = currentCard.location + mod;
        setCurrentCard(movedCard);
    }

    return (
        <div className="corkboard__wall">
            <button className="btn btn-block story-list__title-change" onClick={backToDesk}>Go To Writing Desk</button>

            <div className="corkboard__frame rounded p-5 d-flex justify-content-center align-items-center">
                <div className="corkboard__board d-flex flex-wrap justify-content-center p-2">{cardComponents}</div>
            </div>

            <div className="corkboard__button-bar d-flex justify-content-center">
                <button onClick={addCard} className="btn btn-medium btn-primary">Add New Card</button>
            </div>

            <Modal 
                show={showModal}
                onHide={closeModal}
                animation={false}
                backdrop='static'
                centered={true}
            >    
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Scene Summary</Form.Label>
                            <Form.Control
                                as='textarea'
                                value={currentCard.logline}
                                onChange={changeCardSummary}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={saveCardChanges}>
                        Save Changes
                    </Button>
                    {currentCard.location === 0 ? null : <Button variant="info" onClick={() => moveCard(-1)}>Move Scene Earlier</Button>}
                    {currentCard.location === cards.length - 1 ? null : <Button variant="info" onClick={() => moveCard(1)}>Move Scene Later</Button>}
                    <Button variant="danger" onClick={deleteCard}>
                        Delete Scene
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
};

export default Corkboard;