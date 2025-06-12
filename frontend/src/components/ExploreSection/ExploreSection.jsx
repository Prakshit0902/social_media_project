import axios from "axios";
import { FocusCards } from "../ui/focus-cards";
import { useEffect, useState } from "react";


export function ExploreSection() {
    const [response,setResponse] = useState({})

    useEffect(() => {
    const fetchExploreData = async () => {
        try {
        const t = await axios.get('/api/v1/user/explore');
        setResponse(t.data.data);
        } catch (error) {
        console.error('Error fetching explore data:', error);
        }
    };

    fetchExploreData()
    }, []);

    console.log(response.length)

    const cards = []
    
    for (let i = 0; i < response.length; i++){
        cards[i] = {
            title : response[i].owner,
            src : response[i].postContent
        }
    }


  return <FocusCards cards={cards} />;
}
