import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FocusCards } from '../ui/focus-cards';
import { getUserExploreFeed } from '../../store/slices/feedSlice';
import { getUserProfilesByIds } from '../../store/slices/userSlice'; 

export function ExploreSection() {
  const dispatch = useDispatch();

  
  const { explorePosts,exploreLoading }          = useSelector((state) => state.feed)
  const { profilesById = {} } = useSelector((state) => state.user)


  useEffect(() => {
    dispatch(getUserExploreFeed())
  }, [dispatch])


  useEffect(() => {
    
    if (Array.isArray(explorePosts) && explorePosts.length) {
      const ownerIds = [...new Set(explorePosts.map((p) => p.owner))];
      console.log(ownerIds);
      dispatch(getUserProfilesByIds(ownerIds));
    }
  }, [dispatch, explorePosts,exploreLoading]);

    const cards = Array.isArray(explorePosts)
    ? explorePosts.map((post, idx) => ({
        key   : post._id ?? `${post.owner}-${idx}`,      
        title : profilesById[post.owner]?.username
                  ?? 'exploreLoading...',                     
        src   : post.postContent,
        likes : post.likes,
        comments : post.comments,
        shares : post.shares  
      }))
    : [];



  return (
    <div className="lg:ml-14 md:ml-20 p-4"> 
      <FocusCards cards={cards} />
    </div>
  )
}