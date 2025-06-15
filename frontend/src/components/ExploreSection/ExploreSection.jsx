import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FocusCards } from '../ui/focus-cards';
import { getUserExploreFeed } from '../../store/slices/feedSlice';
import { getUserProfilesByIds } from '../../store/slices/userSlice'; 

export function ExploreSection() {
  const dispatch = useDispatch();

  
  const { posts }          = useSelector((state) => state.feed)
  const { profilesById = {} } = useSelector((state) => state.user)


  useEffect(() => {
    console.log('entered the dispatch explore feed')
    console.log('cookies available' , document.cookie )
    
    
    dispatch(getUserExploreFeed());
  }, [dispatch]);

  useEffect(() => {
    console.log(posts)
    
    if (Array.isArray(posts) && posts.length) {
      const ownerIds = [...new Set(posts.map((p) => p.owner))];
      console.log(ownerIds);
      
      dispatch(getUserProfilesByIds(ownerIds));
    }
  }, [dispatch, posts]);


  const cards = Array.isArray(posts)
    ? posts.map((post, idx) => ({
        key   : post._id ?? `${post.owner}-${idx}`,      
        title : profilesById[post.owner]?.username
                  ?? 'Loading...',                     
        src   : post.postContent,
      }))
    : [];

  return <FocusCards cards={cards} />;
}