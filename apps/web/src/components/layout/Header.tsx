import React, { useState } from 'react'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { styled } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Logo = styled('img')({
  height: 40,
  marginRight: 16
})

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  fontSize: '1rem',
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}))

export const Header: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const navigationItems = [
    { text: t('nav.findTutor'), href: '/find-tutor' },
    { text: t('nav.becomeTutor'), href: '/become-tutor' },
    { text: t('nav.howItWorks'), href: '/how-it-works' }
  ]

  const userMenuItems = user ? [
    { text: t('nav.dashboard'), href: '/dashboard' },
    { text: t('nav.schedule'), href: '/schedule' },
    { text: t('nav.messages'), href: '/messages' },
    { text: t('nav.settings'), href: '/settings' }
  ] : []

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <RouterLink to="/">
            <Logo src="/images/logo.png" alt="WeMaster" />
          </RouterLink>

          {/* Mobile Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.href}
                  onClick={() => {
                    handleCloseNavMenu()
                    navigate(item.href)
                  }}
                >
                  <Typography textAlign="center">{item.text}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Desktop Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navigationItems.map((item) => (
              <NavButton
                key={item.href}
                component={RouterLink}
                to={item.href}
                onClick={handleCloseNavMenu}
              >
                {item.text}
              </NavButton>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title={t('nav.openSettings')}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.name} src={user.avatar} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.href}
                      onClick={() => {
                        handleCloseUserMenu()
                        navigate(item.href)
                      }}
                    >
                      <Typography textAlign="center">{item.text}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      logout()
                    }}
                  >
                    <Typography textAlign="center">{t('nav.logout')}</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  color="primary"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                >
                  {t('nav.register')}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  )
}
