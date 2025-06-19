import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FocusCards } from '../ui/focus-cards'
import { getUserExploreFeed } from '../../store/slices/feedSlice'
import { getUserProfilesByIds } from '../../store/slices/userSlice'
import useInfiniteScroll from '../../hooks/use-infinite-scroll'

export function ExploreSection() {
  const dispatch = useDispatch()

  const { explorePosts, exploreLoading, explorePage, hasMoreExplore } = useSelector((state) => state.feed)
  const { profilesById = {} } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(getUserExploreFeed(1));
  }, [dispatch])


  useEffect(() => {
    if (Array.isArray(explorePosts) && explorePosts.length) {
      const ownerIds = [...new Set(explorePosts.map((p) => p.owner))]
      dispatch(getUserProfilesByIds(ownerIds))
    }
  }, [dispatch, explorePosts])

  // Use the custom hook for infinite scrolling
  const loadMore = () => {
    dispatch(getUserExploreFeed(explorePage + 1))
  }

  const loadMoreRef = useInfiniteScroll(loadMore, exploreLoading, hasMoreExplore)

  const cards = Array.isArray(explorePosts)
    ? explorePosts.map((post, idx) => ({
        key: post._id ?? `${post.owner}-${idx}`,
        title: profilesById[post.owner]?.username ?? 'Loading...',
        src: post.postContent,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
      }))
    : []

  return (
    <div className="lg:ml-14 md:ml-20 p-4">
      <FocusCards cards={cards} />
      <div ref={loadMoreRef} className="h-10"></div>
      {exploreLoading && <div>Loading more posts...</div>}
      {!hasMoreExplore && <div>No more posts to load.</div>}
    </div>
  )
}