import React from 'react';
import { AppBar, Toolbar, Typography, Button, Tooltip, Box, Avatar, Container } from '@mui/material';
import Work from '@mui/icons-material/Work';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Description from '@mui/icons-material/Description';
import Logout from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';

function Navigation({ logout, username }) {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 102, 204, 0.15)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Work sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', m: 0 }}>
                JobTracker
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mt: '2px' }}>
                Career Navigator
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flex: 1, mx: 3 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/jobs"
              startIcon={<Work />}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.95rem',
                fontWeight: 600,
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                },
                px: 2,
                py: 1,
                transition: 'all 0.3s ease',
              }}
            >
              Open Jobs
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/insights"
              startIcon={<TrendingUp />}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.95rem',
                fontWeight: 600,
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                },
                px: 2,
                py: 1,
                transition: 'all 0.3s ease',
              }}
            >
              Insights
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/ai-assistant"
              startIcon={<Description />}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.95rem',
                fontWeight: 600,
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                },
                px: 2,
                py: 1,
                transition: 'all 0.3s ease',
              }}
            >
              AI Assistant
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title={username || 'Loading profile...'}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.4)',
                  width: 40,
                  height: 40,
                  '&:hover': { 
                    transform: 'scale(1.1)', 
                    transition: 'transform 0.2s',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                  fontWeight: 600,
                }}
              >
                {username ? username.charAt(0).toUpperCase() : <AccountCircle />}
              </Avatar>
            </Tooltip>
            
            <Tooltip title="Logout">
              <Button 
                color="inherit" 
                onClick={logout} 
                startIcon={<Logout />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  },
                  px: 1.5,
                  transition: 'all 0.3s ease',
                }}
              >
                Logout
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;
