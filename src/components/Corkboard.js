import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import IndexCard from './IndexCard';
import './Corkboard.css';
// import { CardBody } from 'reactstrap';


const Corkboard = ({currentStoryId, backToDesk, addSceneCallback}) => {
    const [cards, setCards] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentCard, setCurrentCard] = useState({
        id: null,
        card_summary: '',
        location: null,
        content_blocks: '',
        story: null,
        entity_key: '',
    });

    // gets and remembers the scene cards associated with the current story
    useEffect(() => {
        getScenes();
    }, []);
    
    const getScenes = () => {
        axios
            .get(`api/scenes/?story=${currentStoryId}`)
            .then(response => {
                setCards(response.data);
            })
            .catch(error => console.log(error.response.data));
    }
    

    const popOutCard = (card) => {
        const selectedCard = {
            id: card.id,
            card_summary: card.card_summary,
            location: card.location,
            content_blocks: card.content_blocks,
            story: card.story,
            entity_key: card.entity_key,
            }
        setCurrentCard(selectedCard);
        setShowModal(true);
    }
    
    const closeModal = () => {
        setShowModal(false);
        setCurrentCard({
            id: null,
            card_summary: '',
            location: null,
            content_blocks: [],
            story: null,
            entity_key: '',
        })
    }

    const cardComponents = cards.map((card, i) => {
        return (
            <IndexCard 
                key={card.id} 
                showCard={popOutCard} 
                card={card}/>
        )
    });

    // TODO - this does hand over to addScene and make a scene object that gets saved in db
    // but currently the card doesn't show up because the location is null
    // check card does show up as is should once the back end synching objects works
    // -- do a new getScenes request?
    // and then maybe have it so that the new is set to current? maybe also pops open?
    // or maybe just have the corkboard with all cards, they can reopen any one they want
    const addCard = () => {
        const expandedCards = [...cards];
        const newCard = {
            // id: null,
            // card_summary: '',
            // location: null,
            // content_blocks: [],
            // story: currentStoryId,
            // entity_key: '',
        }

        // expandedCards.push(newCard);
        // setCards(expandedCards);

        // popOutCard(newCard);
        addSceneCallback(true);
    };

    // TODO refactor to send update to backend
    const changeCardSummary = (event) => {
        const updatedCard = {
            id: currentCard.id,
            card_summary: event.target.value,
            location: currentCard.location,
            content_blocks: currentCard.content_blocks,
            story: currentStoryId,
            entity_key: currentCard.entity_key,
        };

        setCurrentCard(updatedCard);
    };

    // TODO - refactor to send changes to back end
    const saveCardChanges = () => {
        axios
            .put(`api/scenes/${currentCard.id}/`, currentCard)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response.data))

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

    const deleteCard = () => {
        let mod = 0;
        const trimmedCards = [];

        cards.forEach((card, index) => {
            // keeps all cards except deleted one, but updates their locations
            // locally in state and in the database with a put request
            if (card.id !== currentCard.id) {
                const updated = {...card}
                updated.location = index - mod
                trimmedCards.push(updated)

                axios
                .put(`api/scenes/${updated.id}/`, updated)
                .then(response => console.log(response.data))
                .catch(error => console.log(error.response.data))
            } else {
                // deletes the card we want deleted and tracks whether we've gotten to that card yet in our order
                mod++;
                axios
                    .delete(`api/scenes/${currentCard.id}/`)
                    .then(response => console.log(response.data))
                    .catch(error => console.log(error.response.data))
            }
        })
        // saves the reordered scenes with the correctly updated locations in state
        setCards(trimmedCards);
    }

    const moveCard = (mod) => {
        // prevents card from being moved outside the range of existing scenes
        if ((currentCard.location + mod >= cards.length) || (currentCard.location + mod < 0)) {
            closeModal();
            return;
        }
        
        // saves in case user has made summary changes they haven't saved
        saveCardChanges();
        
        // makes a new array of all scene objects
        // removes the active scene from the array
        // adds teh active scene back in moved one place forward or backward
        const shuffleCards = [...cards];
        shuffleCards.splice(currentCard.location, 1)
        shuffleCards.splice(currentCard.location + mod, 0, currentCard)

        // iterates through the scenes, reassinging each card's location value
        // to its current index in the reordered array
        const updateLocations = shuffleCards.map((card, index) => {
            const updateCard = {...card};
            updateCard.location = index;

            axios
                .put(`api/scenes/${updateCard.id}/`, updateCard)
                .then(response => console.log(response.data))
                .catch(error => console.log(error.response.data))

            return updateCard;
        });
        // saves the reordered scenes with the correctly updated locations in state
        setCards(updateLocations);

        // updates the currentCard object in state to have the correct location
        setCurrentCard({
            id: null,
            card_summary: '',
            location: null,
            content_blocks: '',
            story: null,
            entity_key: '',
        });
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
                                value={currentCard.card_summary}
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