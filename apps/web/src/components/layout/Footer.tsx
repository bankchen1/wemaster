import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  styled,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
} from '@mui/icons-material';
import Image from 'next/image';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Careers', href: '/careers' },
        { text: 'Press', href: '/press' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Tutoring',
      links: [
        { text: 'Find a Tutor', href: '/tutors' },
        { text: 'Become a Tutor', href: '/become-tutor' },
        { text: 'How it Works', href: '/how-it-works' },
        { text: 'Pricing', href: '/pricing' },
        { text: 'Success Stories', href: '/success-stories' },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Safety Center', href: '/safety' },
        { text: 'Community Guidelines', href: '/guidelines' },
        { text: 'Terms of Service', href: '/terms' },
        { text: 'Privacy Policy', href: '/privacy' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Learning Tips', href: '/tips' },
        { text: 'Study Materials', href: '/materials' },
        { text: 'Subject Guides', href: '/guides' },
        { text: 'Tutor Resources', href: '/tutor-resources' },
        { text: 'Parent Guide', href: '/parent-guide' },
      ],
    },
  ];

  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com' },
    { Icon: Twitter, href: 'https://twitter.com' },
    { Icon: Instagram, href: 'https://instagram.com' },
    { Icon: LinkedIn, href: 'https://linkedin.com' },
    { Icon: YouTube, href: 'https://youtube.com' },
  ];

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Image
                src="/logo.svg"
                alt="WeMaster Logo"
                width={40}
                height={40}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: 1,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                WeMaster
              </Typography>
            </Box>
            <Typography color="text.secondary" paragraph>
              Empowering learners worldwide through personalized tutoring and
              expert guidance. Join our community of passionate educators and
              eager students.
            </Typography>
            <Box display="flex" gap={1}>
              {socialLinks.map(({ Icon, href }, index) => (
                <SocialButton
                  key={index}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </SocialButton>
              ))}
            </Box>
          </Grid>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <Grid item xs={6} sm={3} md={2} key={index}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                gutterBottom
                fontWeight={600}
              >
                {section.title}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {section.links.map((link, linkIndex) => (
                  <FooterLink
                    key={linkIndex}
                    href={link.href}
                    variant="body2"
                  >
                    {link.text}
                  </FooterLink>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="body2" color="text.secondary">
            {currentYear} WeMaster. All rights reserved.
          </Typography>
          <Box display="flex" gap={3}>
            <FooterLink href="/terms" variant="body2">
              Terms
            </FooterLink>
            <FooterLink href="/privacy" variant="body2">
              Privacy
            </FooterLink>
            <FooterLink href="/cookies" variant="body2">
              Cookies
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </StyledFooter>
  );
};
