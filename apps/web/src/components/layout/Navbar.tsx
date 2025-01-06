import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Container,
  useScrollTrigger,
  Slide,
  useTheme,
  styled,
  Select,
  FormControl,
} from '@mui/material';
import {
  Language as LanguageIcon,
  AttachMoney as CurrencyIcon,
  Menu as MenuIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchInput } from '../common/SearchInput';
import Link from 'next/link';
import Image from 'next/image';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const theme = useTheme();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
  const [currencyAnchor, setCurrencyAnchor] = useState<null | HTMLElement>(null);

  const trigger = useScrollTrigger();

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <StyledAppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Link href="/" passHref>
              <Logo>
                <Image
                  src="/logo.svg"
                  alt="WeMaster Logo"
                  width={40}
                  height={40}
                  priority
                />
                <Typography
                  variant="h6"
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  WeMaster
                </Typography>
              </Logo>
            </Link>

            {/* Desktop Navigation */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                gap: 2,
                ml: 4,
              }}
            >
              <NavButton>Find Tutors</NavButton>
              <NavButton>Become a Tutor</NavButton>
              <NavButton>How it Works</NavButton>
              <NavButton>Support</NavButton>
            </Box>

            {/* Search Bar */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                mx: 2,
              }}
            >
              <SearchInput
                onSearch={onSearch}
                placeholder="Search for tutors or subjects..."
              />
            </Box>

            {/* Language & Currency Selectors */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <FormControl size="small">
                <Select
                  value="en"
                  variant="outlined"
                  sx={{ minWidth: 100 }}
                  startAdornment={<LanguageIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select
                  value="USD"
                  variant="outlined"
                  sx={{ minWidth: 100 }}
                  startAdornment={<CurrencyIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="CNY">CNY (¥)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Auth Buttons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              <Button color="inherit" sx={{ mr: 1 }}>
                Log In
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                }}
              >
                Sign Up
              </Button>
            </Box>

            {/* Mobile Menu */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={mobileMenuAnchor}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
              >
                <MenuItem onClick={handleMobileMenuClose}>Find Tutors</MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>Become a Tutor</MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>How it Works</MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>Support</MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>Log In</MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>Sign Up</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
    </Slide>
  );
};
