import React from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  Instagram,
  YouTube,
  Facebook,
  Twitter,
  Telegram,
  Wechat,
  Weibo
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(6, 0),
  marginTop: 'auto'
}))

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline'
  }
}))

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}))

const Logo = styled('img')({
  height: 40,
  marginBottom: 16
})

export const Footer: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation()

  const companyLinks = [
    { text: t('footer.whoAreWe'), href: '/about' },
    { text: t('footer.valueProposition'), href: '/value' },
    { text: t('footer.blog'), href: '/blog' }
  ]

  const programLinks = [
    { text: t('footer.giftCard'), href: '/gift-card' },
    { text: t('footer.careerDevelopment'), href: '/career' },
    { text: t('footer.alliancePlan'), href: '/alliance' }
  ]

  const supportLinks = [
    { text: t('footer.faq'), href: '/faq' },
    { text: t('footer.teacherSupport'), href: '/teacher-support' },
    { text: t('footer.studentSupport'), href: '/student-support' }
  ]

  const resourceLinks = [
    { text: t('footer.onlineClassroom'), href: '/classroom' },
    { text: t('footer.paymentIssues'), href: '/payment-support' }
  ]

  const socialLinks = [
    { icon: <Instagram />, href: 'https://instagram.com/wemaster.app' },
    { icon: <YouTube />, href: 'https://youtube.com/wemaster' },
    { icon: <Facebook />, href: 'https://facebook.com/wemaster.app' },
    { icon: <Twitter />, href: 'https://twitter.com/wemaster' },
    { icon: <Telegram />, href: 'https://t.me/wemaster' },
    { icon: <Wechat />, href: '/wechat' },
    { icon: <Weibo />, href: 'https://weibo.com/wemaster' }
  ]

  const renderLinks = (links: Array<{ text: string; href: string }>) => (
    <Box>
      {links.map((link) => (
        <Box key={link.href} mb={1}>
          <FooterLink href={link.href}>{link.text}</FooterLink>
        </Box>
      ))}
    </Box>
  )

  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box mb={3}>
              <Logo src="/images/logo-white.png" alt="WeMaster" />
              <Typography variant="subtitle1" gutterBottom>
                Master Knowledge, Achieve the Future
              </Typography>
            </Box>
            <Box>
              {socialLinks.map((link) => (
                <SocialIcon
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </SocialIcon>
              ))}
            </Box>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="h6" gutterBottom>
              {t('footer.company')}
            </Typography>
            {renderLinks(companyLinks)}
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="h6" gutterBottom>
              {t('footer.programs')}
            </Typography>
            {renderLinks(programLinks)}
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="h6" gutterBottom>
              {t('footer.support')}
            </Typography>
            {renderLinks(supportLinks)}
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="h6" gutterBottom>
              {t('footer.resources')}
            </Typography>
            {renderLinks(resourceLinks)}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              © {new Date().getFullYear()} WeMaster. {t('footer.allRightsReserved')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              <FooterLink href="/privacy" sx={{ mr: 2 }}>
                {t('footer.privacy')}
              </FooterLink>
              <FooterLink href="/terms">
                {t('footer.terms')}
              </FooterLink>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </FooterContainer>
  )
}
