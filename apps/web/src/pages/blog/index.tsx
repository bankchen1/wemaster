import React from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import {
  Typography,
  Grid,
  Card,
  Button,
  Container,
  Box,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/components/blog/BlogCard';
import { FeaturedPost } from '@/components/blog/FeaturedPost';
import { CategoryList } from '@/components/blog/CategoryList';
import { NewsletterSignup } from '@/components/blog/NewsletterSignup';
import { SEO } from '@/components/common/SEO';
import { useI18n } from '@/hooks/useI18n';
import { blogApi } from '@/api/blog';

interface BlogHomeProps {
  featuredPosts: BlogPost[];
  latestPosts: BlogPost[];
  popularPosts: BlogPost[];
  categories: string[];
}

export const BlogHome: React.FC<BlogHomeProps> = ({
  featuredPosts,
  latestPosts,
  popularPosts,
  categories
}) => {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <>
      <SEO
        title={t('blog.meta.title')}
        description={t('blog.meta.description')}
        keywords={t('blog.meta.keywords')}
      />

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box my={4}>
          <Typography variant="h1" component="h1" gutterBottom>
            {t('blog.hero.title')}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            {t('blog.hero.subtitle')}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('blog.search.placeholder')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Categories */}
        <Box my={4}>
          <CategoryList categories={categories} />
        </Box>

        {/* Featured Posts */}
        <Box my={6}>
          <Typography variant="h4" gutterBottom>
            {t('blog.sections.featured')}
          </Typography>
          <Grid container spacing={4}>
            {featuredPosts.map(post => (
              <Grid item xs={12} md={6} key={post.id}>
                <FeaturedPost post={post} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Latest Posts */}
        <Box my={6}>
          <Typography variant="h4" gutterBottom>
            {t('blog.sections.latest')}
          </Typography>
          <Grid container spacing={4}>
            {latestPosts.map(post => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <BlogCard post={post} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Popular Posts */}
        <Box my={6}>
          <Typography variant="h4" gutterBottom>
            {t('blog.sections.popular')}
          </Typography>
          <Grid container spacing={4}>
            {popularPosts.map(post => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <BlogCard post={post} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Newsletter Signup */}
        <Box my={8}>
          <NewsletterSignup />
        </Box>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const [featuredPosts, latestPosts, popularPosts, categories] = await Promise.all([
      blogApi.getFeaturedPosts(locale),
      blogApi.getLatestPosts(locale),
      blogApi.getPopularPosts(locale),
      blogApi.getCategories(locale),
    ]);

    return {
      props: {
        featuredPosts,
        latestPosts,
        popularPosts,
        categories,
      },
      revalidate: 3600, // 每小时重新生成页面
    };
  } catch (error) {
    console.error('Failed to fetch blog data:', error);
    return {
      notFound: true,
    };
  }
};
