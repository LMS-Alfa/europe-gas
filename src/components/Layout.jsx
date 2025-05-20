import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
// Import icons from react-icons
import { FiMenu, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { FiHome, FiTool, FiUsers, FiFileText, FiActivity } from 'react-icons/fi';
import { FiBarChart2, FiPackage } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import WebsiteLogo from './WebsiteLogo';
import LanguageSelector from './LanguageSelector';
import { useTranslationWithForceUpdate } from '../hooks/useTranslationWithForceUpdate';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const Sidebar = styled(motion.aside).attrs(props => {
  // Filter out custom props
  const { isCollapsed, isOpen, ...rest } = props;
  return rest;
})`
  width: ${props => props.isCollapsed ? '70px' : '280px'};
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.isCollapsed ? props.theme.spacing.sm : props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: ${props => props.theme.zIndex.header + 10};
  box-shadow: ${props => props.theme.shadows.md};
  overflow-y: auto;
  transition: width 0.3s ease, padding 0.3s ease;

  ${props => props.isCollapsed && `
    align-items: center;
    padding-left: 0;
    padding-right: 0;
  `}

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 85%;
    max-width: 320px;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform ${props => props.theme.transition.medium};
    padding: ${props => props.theme.spacing.md};
    box-shadow: ${props => props.theme.shadows.lg};
    border-right: 2px solid ${props => props.theme.colors.border};
  }
`;

const SidebarToggleButton = styled(motion.button)`
  background-color: ${props => `${props.theme.colors.primary}08`};
  color: ${props => props.theme.colors.primary};
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${props => `${props.theme.colors.primary}30`};
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}15`};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const CollapsedSidebarButton = styled(motion.button)`
  background-color: ${props => `${props.theme.colors.primary}08`};
  color: ${props => props.theme.colors.primary};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${props => `${props.theme.colors.primary}30`};
  box-shadow: ${props => props.theme.shadows.md};
  position: fixed;
  top: 20px;
  left: 16px;
  z-index: ${props => props.theme.zIndex.header};
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}15`};
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const Content = styled.main.attrs(props => {
  // Filter out custom props
  const { sidebarVisible, showSidebar, isMobile, ...rest } = props;
  return rest;
})`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  margin-left: ${props => {
    if (props.showSidebar && !props.isMobile) {
      return props.sidebarVisible ? '280px' : '70px';
    }
    return '0';
  }};
  min-height: 100vh;
  transition: margin-left ${props => props.theme.transition.medium};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin-left: 0;
    width: 100%;
    padding: ${props => props.theme.spacing.md};
  }
`;

const Header = styled(motion.header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.header - 1};
  box-shadow: ${props => props.theme.shadows.sm};
  margin: -${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin: -${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.md};
    padding: ${props => props.theme.spacing.md};
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const LogoSeparator = styled.div`
  height: 24px;
  width: 1px;
  background: ${props => props.theme.colors.border};
  margin: 0 ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const LogoIcon = styled.div`
  font-size: 1.5rem;
  margin-right: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileMenuButton = styled(motion.button)`
  background: ${props => `${props.theme.colors.primary}08`};
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.circular};
  display: none;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => `${props.theme.colors.primary}30`};
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}15`};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
  }
`;

const HeaderTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const UserDropdown = styled(motion.div)`
  position: relative;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.circular};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  border: 2px solid ${props => props.theme.colors.primary}20;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const UserDropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
  min-width: 200px;
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.dropdown};
  border: 1px solid ${props => props.theme.colors.border};
`;

const UserInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  
  ${props => props.isCollapsed && `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${props.theme.spacing.sm};
  `}
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.md};
  margin-bottom: 2px;
`;

const UserRole = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DropdownItem = styled.button.attrs(props => {
  // Filter out custom props
  const { danger, isCollapsed, ...rest } = props;
  return rest;
})`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  text-align: left;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.danger ? props.theme.colors.error : props.theme.colors.text.primary};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: ${props => props.danger ? 
      `${props.theme.colors.error}10` : 
      props.theme.colors.hover};
  }
  
  ${props => props.isCollapsed && `
    justify-content: center;
    padding: ${props.theme.spacing.sm};
  `}
`;

const Logo = styled(motion.div).attrs(props => {
  // Filter out custom props
  const { isCollapsed, ...rest } = props;
  return rest;
})`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.isCollapsed ? '1.2rem' : '1.5rem'};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const NavMenu = styled.nav.attrs(props => {
  // Filter out custom props
  const { isCollapsed, ...rest } = props;
  return rest;
})`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  ${props => props.isCollapsed && `
    align-items: center;
  `}
`;

const NavItem = styled(motion(Link)).attrs(props => {
  // Filter out custom props
  const { active, isCollapsed, ...rest } = props;
  return rest;
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.isCollapsed ? 
    props.theme.spacing.sm : 
    `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.active ? 
    props.theme.colors.primary : 
    props.theme.colors.text.primary};
  text-decoration: none;
  transition: all ${props => props.theme.transition.fast};
  position: relative;
  
  &:hover {
    background-color: ${props => props.active ? 
      `${props.theme.colors.primary}15` : 
      props.theme.colors.hover};
  }
  
  ${props => props.active && `
    background-color: ${props.theme.colors.primary}10;
    font-weight: ${props.theme.typography.fontWeight.medium};
  `}
  
  ${props => props.isCollapsed && `
    justify-content: center;
    width: 42px;
    height: 42px;
    padding: 0;
  `}
`;

const NavIcon = styled.div.attrs(props => {
  // Filter out custom props
  const { isCollapsed, ...rest } = props;
  return rest;
})`
  font-size: ${props => props.isCollapsed ? '1.25rem' : '1.1rem'};
  min-width: ${props => props.isCollapsed ? 'auto' : '24px'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span.attrs(props => {
  // Filter out custom props
  const { isCollapsed, ...rest } = props;
  return rest;
})`
  font-size: ${props => props.theme.typography.fontSize.sm};
  transition: opacity 0.2s;
  white-space: nowrap;
  opacity: ${props => props.isCollapsed ? 0 : 1};
  max-width: ${props => props.isCollapsed ? 0 : '200px'};
  overflow: hidden;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: ${props => props.theme.zIndex.header + 5};
  backdrop-filter: blur(3px);
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const PageTitle = styled(motion.h1)`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -${props => props.theme.spacing.xs};
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSize.xl};
  }
`;

const LogoWrapper = styled.div.attrs(props => {
  // Filter out custom props
  const { isCollapsed, ...rest } = props;
  return rest;
})`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isCollapsed ? 'center' : 'space-between'};
  padding: ${props => props.isCollapsed ? 
    props.theme.spacing.sm : 
    `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ToggleButtonContainer = styled.div.attrs(props => {
  // Filter out custom props
  const { isCollapsed, ...rest } = props;
  return rest;
})`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Users = styled.div.attrs(props => {
  // Filter out any custom props
  const { ...rest } = props;
  return rest;
})`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.3
    }
  },
  closed: {
    x: "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      duration: 0.3
    }
  }
};

const menuItemVariants = {
  hidden: {
    opacity: 0,
    x: -10
  },
  visible: i => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1
    }
  })
};

const dropdownVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

const Layout = ({ children, title }) => {
  const { t, currentLanguage } = useTranslationWithForceUpdate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);
  
  // Determine if the sidebar should be shown based on user role
  const isAdmin = currentUser?.role === 'admin';
  const showSidebar = isAdmin;
  
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 960;
      setIsMobile(newIsMobile);
      
      // If transitioning from mobile to desktop, close the mobile sidebar
      if (!newIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);
  
  useEffect(() => {
    // Close sidebar on route change on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      // Open sidebar automatically when changing pages on desktop
      setSidebarVisible(true);
    }
  }, [location.pathname, isMobile]);
  
  // Toggle sidebar on mobile
  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle sidebar visibility on desktop
  const toggleDesktopSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle navigation item click
  const handleNavItemClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'dashboard':
        return <FiHome size={20} />;
      case 'parts':
        return <FiPackage size={20} />;
      case 'users':
        return <FiUsers size={20} />;
      case 'reports':
        return <FiFileText size={20} />;
      case 'entry':
        return <FiTool size={20} />;
      case 'settings':
        return <FiActivity size={20} />;
      default:
        return <FiHome size={20} />;
    }
  };

  // Define navigation items based on user role with translations
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { path: '/admin', label: t('navigation.dashboard'), icon: 'dashboard' },
        { path: '/admin/parts', label: t('navigation.parts'), icon: 'parts' },
        { path: '/admin/users', label: t('navigation.users'), icon: 'users' },
        { path: '/admin/reports', label: t('navigation.bonusReports'), icon: 'reports' }
      ];
    } else {
      return [
        { path: '/dashboard', label: t('enterPart.title'), icon: 'entry' },
      ];
    }
  };

  // Update nav items when language changes
  const [navItems, setNavItems] = useState(getNavItems());
  
  useEffect(() => {
    setNavItems(getNavItems());
  }, [currentLanguage, isAdmin]);
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return '?';
    
    // If we have firstName and lastName properties
    if (currentUser.firstName || currentUser.lastName) {
      const firstInitial = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : '';
      const lastInitial = currentUser.lastName ? currentUser.lastName.charAt(0).toUpperCase() : '';
      return firstInitial + lastInitial || '?';
    }
    
    // Fallback to name property (for backward compatibility)
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    
    return '?';
  };

  // Create a wrapper component that doesn't pass down the filtered props
  const ContentWrapper = ({ children }) => {
    // These props will be filtered by the .attrs method
    const contentProps = {
      sidebarVisible: showSidebar && !isMobile && sidebarVisible,
      showSidebar,
      isMobile
    };
    
    return <Content {...contentProps}>{children}</Content>;
  };

  return (
    <LayoutContainer>
      <AnimatePresence>
        {sidebarOpen && showSidebar && (
          <Overlay 
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {showSidebar && (
        <Sidebar 
          isOpen={isMobile ? sidebarOpen : true}
          isCollapsed={!isMobile && !sidebarVisible}
          variants={sidebarVariants}
          initial={false}
          animate={isMobile 
            ? (sidebarOpen ? "open" : "closed") 
            : "open"
          }
        >
          <LogoWrapper isCollapsed={!isMobile && !sidebarVisible}>
            <Logo
              isCollapsed={!isMobile && !sidebarVisible}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {!isMobile && !sidebarVisible ? (
                <span>EG</span>
              ) : (
                <span>Europe Gas</span>
              )}
            </Logo>
            
            {!isMobile && (
              <ToggleButtonContainer isCollapsed={!isMobile && !sidebarVisible}>
                <SidebarToggleButton
                  onClick={toggleDesktopSidebar}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {sidebarVisible ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
                </SidebarToggleButton>
              </ToggleButtonContainer>
            )}
          </LogoWrapper>
          <NavMenu isCollapsed={!isMobile && !sidebarVisible}>
            {navItems.map((item, i) => (
              <NavItem 
                key={item.path} 
                to={item.path}
                active={location.pathname === item.path ? 1 : 0}
                isCollapsed={!isMobile && !sidebarVisible}
                custom={i}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: !isMobile && !sidebarVisible ? 1.1 : 1.0, x: !isMobile && !sidebarVisible ? 0 : 4 }}
                data-tooltip={item.label}
                onClick={handleNavItemClick}
              >
                <NavIcon isCollapsed={!isMobile && !sidebarVisible}>
                  {getIconComponent(item.icon)}
                </NavIcon>
                <NavText isCollapsed={!isMobile && !sidebarVisible}>
                  {item.label}
                </NavText>
              </NavItem>
            ))}
          </NavMenu>
          <UserInfo isCollapsed={!isMobile && !sidebarVisible}>
            <Users>
              {(isMobile || sidebarVisible) && (
                <>
                  <UserName>
                    {currentUser?.firstName && currentUser?.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser?.name || 'User'}
                  </UserName>
                  <UserRole>{currentUser?.role}</UserRole>
                </>
              )}
            </Users>
            <DropdownItem 
              onClick={logout}
              danger
              isCollapsed={!isMobile && !sidebarVisible}
            >
              <FiLogOut size={!isMobile && !sidebarVisible ? 20 : 18} /> 
              {(isMobile || sidebarVisible) && t('navigation.logout')}
            </DropdownItem>
          </UserInfo>
        </Sidebar>
      )}
      
      <ContentWrapper>
        <Header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LogoContainer>
            {showSidebar && (
              <>
                {/* Mobile burger menu - only shown on mobile */}
                <MobileMenuButton 
                  onClick={toggleMobileSidebar}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMenu size={24} />
                </MobileMenuButton>
              </>
            )}

            {/* Remove the WebsiteLogo component from admin pages */}
            {!isAdmin && (
              <>
                <WebsiteLogo 
                  size={isMobile ? 'small' : 'normal'} 
                  showText={!isMobile}
                />
                <LogoSeparator />
              </>
            )}
          </LogoContainer>
          
          <HeaderActions>
            <LanguageSelector />
            <ThemeToggle />
            
            <UserDropdown>
              <UserAvatar onClick={toggleDropdown}>
                {getUserInitials()}
              </UserAvatar>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <UserDropdownMenu
                    variants={dropdownVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <UserInfo>
                      <Users>
                        <UserName>
                          {currentUser?.firstName && currentUser?.lastName
                            ? `${currentUser.firstName} ${currentUser.lastName}`
                            : currentUser?.name || 'User'}
                        </UserName>
                        <UserRole>{currentUser?.role}</UserRole>
                      </Users>
                      <DropdownItem 
                        onClick={logout}
                        danger
                      >
                        <FiLogOut size={16} /> Logout
                      </DropdownItem>
                    </UserInfo>
                  </UserDropdownMenu>
                )}
              </AnimatePresence>
            </UserDropdown>
          </HeaderActions>
        </Header>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </ContentWrapper>
    </LayoutContainer>
  );
};

// Export both as default and named export
export default Layout;
export { Layout }; 