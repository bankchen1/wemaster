import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTutorReviews } from '@/lib/api/tutors';

interface TutorReviewsProps {
  tutorId: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  subject: string;
  createdAt: string;
  helpful: number;
  isHelpful?: boolean;
}

export function TutorReviews({ tutorId }: TutorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [tutorId, filter, sort, page]);

  async function loadReviews(reset = false) {
    try {
      setLoading(true);
      const newPage = reset ? 1 : page;
      const data = await getTutorReviews(tutorId, {
        filter,
        sort,
        page: newPage,
        limit: 10,
      });

      if (reset) {
        setReviews(data.reviews);
      } else {
        setReviews(prev => [...prev, ...data.reviews]);
      }

      setHasMore(data.hasMore);
      if (reset) {
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (value: string) => {
    setFilter(value);
    loadReviews(true);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    loadReviews(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      // API call to mark review as helpful
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? {
                ...review,
                helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1,
                isHelpful: !review.isHelpful,
              }
            : review
        )
      );
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const handleReport = async (reviewId: string) => {
    try {
      // API call to report review
      // Show confirmation dialog or toast
    } catch (error) {
      console.error('Failed to report review:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Reviews</h2>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="rating-high">Highest Rating</SelectItem>
              <SelectItem value="rating-low">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-b-0">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <Avatar className="w-12 h-12">
                  <img src={review.userAvatar} alt={review.userName} />
                </Avatar>
                <div>
                  <div className="font-medium">{review.userName}</div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-current' : 'fill-none'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()} • {review.subject}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={review.isHelpful ? 'text-primary' : ''}
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {review.helpful}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReport(review.id)}
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="mt-4 text-gray-600">{review.content}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </Card>
  );
}
