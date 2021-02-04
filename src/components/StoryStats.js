import React, {useState, useEffect} from 'react';
import axios from 'axios';

const StoryStats = () => {
    const [allStories, setAllStories] = useState([]);

    // callback to app so app remembers what the current story is
    // how to callback without preventing event (and thus making link useless?)
    // have this as a component Writing Desk renders?

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