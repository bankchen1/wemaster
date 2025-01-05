import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TutorCard } from './TutorCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFavorites } from '@/lib/api/tutors';
import { Loader2 } from 'lucide-react';

interface FavoritesListProps {
  userId: string;
}

export function FavoritesList({ userId }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore();
    }
  }, [inView]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites(1);
      setFavorites(response.favorites);
      setHasMore(response.page < response.totalPages);
      setPage(2);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await getFavorites(page);
      setFavorites((prev) => [...prev, ...response.favorites]);
      setHasMore(response.page < response.totalPages);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to load more favorites:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">暂无收藏</h3>
        <p className="text-gray-500 mb-6">
          浏览导师列表，收藏你感兴趣的导师
        </p>
        <Button variant="outline" asChild>
          <a href="/tutors">浏览导师</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {favorites.map((favorite, index) => (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <TutorCard tutor={favorite.tutor} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {loadingMore && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>加载更多...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
