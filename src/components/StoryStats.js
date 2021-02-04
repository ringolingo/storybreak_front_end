import React, {useState, useEffect} from 'react';
import axios from 'axios';

const StoryStats = () => {
    const [allStories, setAllStories] = useState([]);

    // if I'm going to keep this there's no reason for it to have its own axios call
    // should just get info handed down in props

    const generateTitles = allStories.map((story, i) => {
        return <p key={i}>{story.title} - last updated {story.last_updated}</p>
    });

    useEffect(() => {
        axios
            .get("/api/stories/")
            .then(response => setAllStories(response.data))
            .catch(error => console.log(error));
    }, []);


    return (
        <div>{generateTitles}</div>
    )
}

export default StoryStats;