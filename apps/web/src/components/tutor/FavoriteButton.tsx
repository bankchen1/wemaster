import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { addFavorite, removeFavorite, checkIsFavorite } from '@/lib/api/tutors';

interface FavoriteButtonProps {
  tutorId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function FavoriteButton({
  tutorId,
  variant = 'outline',
  size = 'icon',
  showCount = false,
  count = 0,
  className = '',
}: FavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(count);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkFavoriteStatus();
    }
  }, [tutorId, user, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const { isFavorite } = await checkIsFavorite(tutorId);
      setIsFavorite(isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: '请先登录',
        description: '收藏功能需要登录后才能使用',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      if (isFavorite) {
        await removeFavorite(tutorId);
        setFavoriteCount((prev) => prev - 1);
        toast({
          title: '已取消收藏',
          description: '该导师已从您的收藏列表中移除',
        });
      } else {
        await addFavorite(tutorId);
        setFavoriteCount((prev) => prev + 1);
        toast({
          title: '收藏成功',
          description: '该导师已添加到您的收藏列表',
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`group ${className}`}
      onClick={handleFavoriteClick}
      disabled={isLoading}
    >
      <Heart
        className={`${
          isFavorite
            ? 'fill-red-500 stroke-red-500'
            : 'stroke-gray-500 group-hover:stroke-red-500'
        } transition-colors ${size === 'icon' ? 'h-4 w-4' : 'h-5 w-5'}`}
      />
      {showCount && (
        <span
          className={`ml-2 ${
            isFavorite ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {favoriteCount}
        </span>
      )}
    </Button>
  );
}
