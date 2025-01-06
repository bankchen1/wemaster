import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'WeMaster - Expert Online Tutoring Platform',
  description = 'Connect with expert tutors worldwide for personalized learning experiences. Find the perfect tutor for any subject, language, or skill.',
  keywords = 'online tutoring, private tutors, language learning, academic help, professional development',
  image = '/images/og-image.jpg',
  article = false,
}) => {
  const router = useRouter();
  const canonicalUrl = `https://wemaster.com${router.asPath}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content="WeMaster" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={article ? 'article' : 'website'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@WeMaster" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'WeMaster',
            description: description,
            url: 'https://wemaster.com',
            logo: 'https://wemaster.com/images/logo.png',
            sameAs: [
              'https://facebook.com/WeMaster',
              'https://twitter.com/WeMaster',
              'https://linkedin.com/company/WeMaster',
              'https://instagram.com/WeMaster',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-555-123-4567',
              contactType: 'customer service',
              areaServed: 'Worldwide',
              availableLanguage: ['English', 'Chinese', 'Spanish'],
            },
          }),
        }}
      />

      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#ffffff" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="notranslate" />
    </Head>
  );
};
