import { FocusCards } from "../ui/focus-cards";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserExploreFeed } from "../../store/slices/feedSlice";
import { getUserProfilesByIds } from "../../store/slices/userSlice";

export function ExploreSection() {
  const dispatch = useDispatch();

  const posts        = useSelector(state => state.feed.posts);
  const profilesById = useSelector(state => state.user?.profilesById) || {};

  /* 1. Fetch explore feed on mount */
  useEffect(() => { dispatch(getUserExploreFeed()); }, [dispatch]);

  /* 2. When posts arrive, fetch the missing owner profiles */
  useEffect(() => {
    if (Array.isArray(posts) && posts.length) {
      const ownerIds = [...new Set(posts.map(p => p.owner))];
      dispatch(getUserProfilesByIds(ownerIds));
    }
  }, [dispatch, posts]);

  /* 3. Build card list */
  const cards = Array.isArray(posts)
    ? posts.map((post, idx) => ({
        key  : post._id || `${post.owner}-${idx}`,        // unique
        title: profilesById[post.owner]?.username ?? "Loading…",
        src  : post.postContent
      }))
    : [];

  return <FocusCards cards={cards} />;
}