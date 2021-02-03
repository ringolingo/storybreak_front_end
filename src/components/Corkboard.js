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
    const [showModal, setShowModal] = useState(false);
    const [currentCard, setCurrentCard] = useState({
        id: null,
        logline: '',
    });

    const popOutCard = (card) => {
        const selectedCard = {
            id: card.id,
            logline: card.logline,
        }
        setCurrentCard(selectedCard);
        setShowModal(true);
    }
    
    const closeModal = () => {
        setShowModal(false);
        setCurrentCard({
            id: null,
            logline: null,
        })
    }

    const cardComponents = cards.map((card) => {
        return (
            <IndexCard logline={card.logline} key={card.id} id={card.id} showCard={popOutCard} />
        )
    });

    // TODO refactor to connect with backend
    const addCard = () => {
        const expandedCards = [...cards];
        const newCard = {
            id: cards.length + 1,
            logline: '',
        }
        expandedCards.push(newCard);
        setCards(expandedCards);

        popOutCard(newCard);
    };

    const changeCardSummary = (event) => {
        const updatedCard = {
            id: currentCard.id,
            logline: event.target.value,
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
            if (card.id != currentCard.id) {
                trimmedCards.push(card);
            }
        });

        setCards(trimmedCards);
        closeModal();
    }

    return (
        <div className="corkboard__wall">
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
                    <Button variant="danger" onClick={deleteCard}>
                        Delete Scene
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
};

export default Corkboard;