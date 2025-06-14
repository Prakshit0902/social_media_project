import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FocusCards } from '../ui/focus-cards';
import { getUserExploreFeed } from '../../store/slices/feedSlice';
import { getUserProfilesByIds } from '../../store/slices/userSlice';

export function ExploreSection() {
  const dispatch = useDispatch();

  // ---------------------------------------------------------------------------
  // Redux state
  // ---------------------------------------------------------------------------
  const { posts }          = useSelector((state) => state.feed);
  const { profilesById = {} } = useSelector((state) => state.user); // default {}

  // ---------------------------------------------------------------------------
  // Side effects
  // ---------------------------------------------------------------------------
  // 1) Load explore feed on mount
  useEffect(() => {
    dispatch(getUserExploreFeed());
  }, [dispatch]);

  // 2) After posts arrive, load all unique owners’ profiles
  useEffect(() => {
    if (Array.isArray(posts) && posts.length) {
      const ownerIds = [...new Set(posts.map((p) => p.owner))];
      dispatch(getUserProfilesByIds(ownerIds));
    }
  }, [dispatch, posts]);

  // ---------------------------------------------------------------------------
  // Derived data for <FocusCards />
  // ---------------------------------------------------------------------------
  const cards = Array.isArray(posts)
    ? posts.map((post, idx) => ({
        key   : post._id ?? `${post.owner}-${idx}`,      // UNIQUE!
        title : profilesById[post.owner]?.username
                  ?? 'Loading...',                      // Fallback until profile loads
        src   : post.postContent,
        // add any other props FocusCards expects here…
      }))
    : [];

  return <FocusCards cards={cards} />;
}