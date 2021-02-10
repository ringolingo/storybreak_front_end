import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import IndexCard from './IndexCard';
import './Corkboard.css';
// import { CardBody } from 'reactstrap';


const Corkboard = ({currentStoryId, backToDesk}) => {
    const [cards, setCards] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentCard, setCurrentCard] = useState({
        id: null,
        card_summary: '',
        location: null,
        content_blocks: [],
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
                setCards(response.data.filter(card => card['story'] == currentStoryId));
            })
            .catch(error => console.log(error.response.data));
        // axios
        // .get(`api/scenes`)
        // .then(response => {
        //     setCards(response.data.filter(card => card['story'] == currentStoryId));
        // })
        // .catch(error => console.log(error.response.data));
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

    // TODO refactor to connect with backend
    // adding a card will need to first add a scene from App
    // (can call a callback function that gets handed to it)
    // then get entity_key and content_blocks from App
    // and id from HTTP response
    // (after the callback function, App sets these 3 in state and hands down as props -- would corkboard have then? or wouldn't work until next render?)
    // what happens in actual corkboard - can handle getting summary,
    // and setting story to currentStoryId
    // location should technically be based off location of scene but for now let's just have it default to last
    // which can be handled in corkboard
    // WAIT no
    // app doesn't need to hand any of this info down, it will be saved to the scene object that gets made
    // when it adds a scene
    // add card needs to make the callback to make a scene
    // then do a new getScenes request
    // (then ideally identify the new card and pop it out)
    // (but at the very least that way it'll be on the board and the user can double click it)
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
        expandedCards.push(newCard);
        setCards(expandedCards);

        popOutCard(newCard);
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
        axios
            .delete(`api/scenes/${currentCard.id}/`)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response.data))

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

        saveCardChanges();
        
        const shuffleCards = [...cards];
        shuffleCards.splice(currentCard.location, 1)
        shuffleCards.splice(currentCard.location + mod, 0, currentCard)

        const updateLocations = shuffleCards.map((card, index) => {
            const updateCard = {...card};
            updateCard.location = index;

            axios
                .put(`api/scenes/${updateCard.id}/`, updateCard)
                .then(response => console.log(response.data))
                .catch(error => console.log(error.response.data))

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