import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, CssBaseline, createTheme, Dialog, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Cancel from '@mui/icons-material/Cancel';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import JobsPage from './pages/JobsPage';
import InsightsPage from './pages/InsightsPage';
import ResumePage from './pages/ResumePage';

const API_BASE = 'https://job-tracker-xqv8.onrender.com';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0066cc',
      light: '#1e88e5',
      dark: '#0052a3',
    },
    secondary: {
      main: '#00d4ff',
      light: '#4dd0ff',
      dark: '#00a3cc',
    },
    success: {
      main: '#00c853',
    },
    warning: {
      main: '#ff6d00',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f8fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      letterSpacing: '-1px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.5px',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
          '&:hover': {
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.3s ease',
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0 4px 15px rgba(0, 102, 204, 0.4)',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0, 102, 204, 0.6)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover fieldset': {
              borderColor: '#0066cc',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          height: 32,
        },
      },
    },
  },
});

const STATUS_INFO = {
  interview: {
    title: 'Interview Invitation!',
    message: (company, position) => `Great news! ${company} has carefully reviewed your application for the ${position} role and is impressed with your qualifications. You have been shortlisted for an interview. A recruiter will reach out within 2–3 business days to coordinate a convenient time slot.`,
    color: '#f57c00',
    bg: 'rgba(255, 152, 0, 0.08)',
    Icon: CalendarToday,
  },
  rejected: {
    title: 'Application Update',
    message: (company, position) => `Thank you for your interest in the ${position} position at ${company}. After a thorough review of all applications, their hiring team has decided to move forward with candidates whose background more closely aligns with their current requirements. We encourage you to keep pursuing new opportunities.`,
    color: '#d32f2f',
    bg: 'rgba(244, 67, 54, 0.08)',
    Icon: Cancel,
  },
  hired: {
    title: 'Offer Extended — Congratulations!',
    message: (company, position) => `Outstanding achievement! ${company} is thrilled to extend a formal job offer for the ${position} position. Your skills, experience, and passion stood out among all candidates. You will receive an official offer letter and onboarding details from their HR department shortly. Welcome to the team!`,
    color: '#388e3c',
    bg: 'rgba(76, 175, 80, 0.08)',
    Icon: EmojiEvents,
  },
};

function AnimatedRoutes({ openJobs, fetchOpenJobs, applications, fetchApplications, fetchInsights, insights, handleStatusUpdate, token }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/jobs" 
          element={
            <JobsPage 
              openJobs={openJobs}
              fetchOpenJobs={fetchOpenJobs}
              applications={applications}
              fetchApplications={fetchApplications}
              fetchInsights={fetchInsights}
              onStatusUpdate={handleStatusUpdate}
            />
          } 
        />
        <Route 
          path="/insights" 
          element={
            <InsightsPage 
              insights={insights}
              applications={applications}
              fetchApplications={fetchApplications}
              fetchInsights={fetchInsights}
            />
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={<ResumePage token={token} openJobs={openJobs} />} 
        />
        <Route path="/" element={<Navigate to="/jobs" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [openJobs, setOpenJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [insights, setInsights] = useState({ 
    total_applications: 0, 
    applied: 0, 
    interviews: 0, 
    rejected: 0, 
    success_rate: 0 
  });
  const [statusNotification, setStatusNotification] = useState({ open: false, status: '', company: '', position: '' });

  useEffect(() => {
    axios.defaults.baseURL = API_BASE;
    if (token) {
      console.log('Setting token:', token.substring(0, 20) + '...');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Axios Authorization header: SET');
      localStorage.setItem('token', token);
      
      // Call fetch functions after axios is configured
      setTimeout(() => {
        fetchUser();
        fetchOpenJobs();
        fetchApplications();
        fetchInsights();
      }, 50);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUsername('');
      setOpenJobs([]);
      setApplications([]);
    }
  }, [token]);

  const fetchOpenJobs = async () => {
    try {
      console.log('Fetching open jobs with token...');
      const response = await axios.get('/open_jobs');
      console.log('Open jobs fetched:', response.data.length, 'jobs');
      setOpenJobs(response.data);
    } catch (error) {
      console.error('Error fetching open jobs:', error.response?.status, error.response?.data, error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      const response = await axios.get('/applications');
      console.log('Applications fetched:', response.data.length);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error.response?.status);
    }
  };

  const fetchInsights = async () => {
    try {
      console.log('Fetching insights...');
      const response = await axios.get('/insights');
      console.log('Insights fetched');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error.response?.status);
    }
  };

  const fetchUser = async () => {
    try {
      console.log('Fetching user...');
      const response = await axios.get('/user');
      console.log('User fetched:', response.data.username);
      setUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching user:', error.response?.status);
    }
  };

  const handleStatusUpdate = ({ status, company, position }) => {
    setStatusNotification({ open: true, status, company, position });
  };

  const logout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setOpenJobs([]);
    setApplications([]);
    setInsights({ total_applications: 0, applied: 0, interviews: 0, rejected: 0, success_rate: 0 });
    console.log('Logged out');
  };

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <LoginPage setToken={setToken} />
        </motion.div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation logout={logout} username={username} />
        <Box sx={{ height: '72px' }} />
        <AnimatedRoutes
          openJobs={openJobs}
          fetchOpenJobs={fetchOpenJobs}
          applications={applications}
          fetchApplications={fetchApplications}
          fetchInsights={fetchInsights}
          insights={insights}
          handleStatusUpdate={handleStatusUpdate}
          token={token}
        />
      </Router>
        {statusNotification.open && (() => {
          const info = STATUS_INFO[statusNotification.status] || STATUS_INFO.interview;
          const IconComp = info.Icon;
          return (
            <Dialog
              open={statusNotification.open}
              onClose={() => setStatusNotification({ ...statusNotification, open: false })}
              maxWidth="sm"
              fullWidth
              PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
            >
              <Box sx={{ background: `linear-gradient(135deg, ${info.color} 0%, ${info.color}bb 100%)`, p: 4, textAlign: 'center' }}>
                <Box sx={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <IconComp sx={{ fontSize: 40, color: '#fff' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.3rem', mb: 0.5 }}>
                  {info.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  {statusNotification.company} &mdash; {statusNotification.position}
                </Typography>
              </Box>
              <DialogContent sx={{ p: 3.5, backgroundColor: info.bg }}>
                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.8, textAlign: 'center', fontSize: '0.97rem' }}>
                  {info.message(statusNotification.company, statusNotification.position)}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2.5, justifyContent: 'center', backgroundColor: info.bg, borderTop: `1px solid ${info.color}20` }}>
                <Button
                  onClick={() => setStatusNotification({ ...statusNotification, open: false })}
                  variant="contained"
                  sx={{ borderRadius: '10px', fontWeight: 700, px: 5, py: 1.2, backgroundColor: info.color, '&:hover': { backgroundColor: info.color, filter: 'brightness(0.88)' } }}
                >
                  Got it
                </Button>
              </DialogActions>
            </Dialog>
          );
        })()}
    </ThemeProvider>
  );
}

export default App;

