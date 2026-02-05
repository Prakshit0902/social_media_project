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
        src: post.media[0]?.url,
        likes: post.likes,
        comments: post.comments.length,
        shares: post.shares,
      }))
    : []

  return (
    <div className="lg:ml-14 md:ml-20 p-4 min-h-screen">
      <FocusCards cards={cards} />
      <div ref={loadMoreRef} className="h-10"></div>
      {exploreLoading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-neutral-400 text-sm">Loading more posts...</span>
        </div>
      )}
      {!hasMoreExplore && cards.length > 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-xl">✨</span>
            <span className="text-neutral-400 text-sm">You've explored it all!</span>
          </div>
        </div>
      )}
      {!exploreLoading && cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nothing to explore yet</h3>
          <p className="text-neutral-500 text-sm">Check back later for new content!</p>
        </div>
      )}
    </div>
  )
}