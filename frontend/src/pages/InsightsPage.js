import React from 'react';
import { motion } from 'framer-motion';
import {
  Container, Card, CardContent, Typography, Grid, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Button, Stack
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Work from '@mui/icons-material/Work';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Phone from '@mui/icons-material/Phone';
import CheckCircle from '@mui/icons-material/CheckCircle';
import TrendingDown from '@mui/icons-material/TrendingDown';
import AccessTime from '@mui/icons-material/AccessTime';
import Cancel from '@mui/icons-material/Cancel';
import axios from 'axios';
import { useState } from 'react';

const API_BASE = 'https://job-tracker-xqv8.onrender.com';

function InsightsPage({ insights, applications, fetchApplications, fetchInsights }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingApp, setEditingApp] = useState(null);
  const [open, setOpen] = useState(false);
  const [statusForm, setStatusForm] = useState('applied');

  const handleEdit = (app) => {
    setEditingApp(app);
    setStatusForm(app.status);
    setOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingApp) return;
    try {
      const apiUrl = `${API_BASE}/applications/${editingApp.id}`;
      await axios.put(apiUrl, { status: statusForm });
      setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
      setOpen(false);
      setEditingApp(null);
      await fetchApplications();
      await fetchInsights();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const handleDelete = async (appId) => {
    try {
      const apiUrl = `${API_BASE}/applications/${appId}`;
      await axios.delete(apiUrl);
      setSnackbar({ open: true, message: 'Application deleted!', severity: 'success' });
      await fetchApplications();
      await fetchInsights();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting application', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: { bg: 'rgba(33, 150, 243, 0.1)', color: '#1976d2', label: 'Applied' },
      interview: { bg: 'rgba(255, 152, 0, 0.1)', color: '#f57c00', label: 'Interview' },
      rejected: { bg: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f', label: 'Rejected' },
      hired: { bg: 'rgba(76, 175, 80, 0.1)', color: '#388e3c', label: 'Hired' }
    };
    return colors[status] || colors.applied;
  };

  const StatCard = ({ icon: Icon, label, value, color, delay, bgColor, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.03 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${color}22`,
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: `0 12px 40px ${color}44` },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '4px',
            background: gradient || color,
          },
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box
            sx={{
              background: bgColor,
              width: '64px', height: '64px',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              boxShadow: `0 4px 12px ${color}33`,
            }}
          >
            <Icon sx={{ fontSize: 34, color }} />
          </Box>
          <Typography variant="body2" sx={{ color: '#888', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.8px', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color, fontSize: '2.4rem', lineHeight: 1 }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          mb: 6, p: 4, borderRadius: '20px',
          background: 'linear-gradient(135deg, #0066cc08 0%, #00d4ff10 100%)',
          border: '1px solid rgba(0,102,204,0.08)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Box sx={{ background: 'linear-gradient(135deg, #0066cc, #00d4ff)', borderRadius: '14px', p: 1.2, display: 'flex' }}>
            <TrendingUp sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.3, color: '#0066cc' }}>
              Application Insights
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontSize: '1.05rem' }}>
              Track your job application progress and performance metrics
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 6 }}>
        <StatCard icon={Work} label="Total Applications" value={insights.total_applications} color="#0066cc" bgColor="rgba(0,102,204,0.1)" gradient="linear-gradient(90deg,#0066cc,#00d4ff)" delay={0} />
        <StatCard icon={Phone} label="Interviews" value={insights.interviews} color="#f57c00" bgColor="rgba(245,124,0,0.1)" gradient="linear-gradient(90deg,#f57c00,#ffca28)" delay={0.1} />
        <StatCard icon={Cancel} label="Rejected" value={insights.rejected} color="#d32f2f" bgColor="rgba(211,47,47,0.1)" gradient="linear-gradient(90deg,#d32f2f,#ff5252)" delay={0.2} />
        <StatCard icon={TrendingUp} label="Success Rate" value={`${insights.success_rate}%`} color="#388e3c" bgColor="rgba(56,142,60,0.1)" gradient="linear-gradient(90deg,#388e3c,#69f0ae)" delay={0.3} />
      </Box>

      {/* My Applications List */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            color: '#0066cc',
            textTransform: 'uppercase',
            fontSize: '0.95rem',
            letterSpacing: '0.5px',
          }}
        >
          My Applications
        </Typography>
        <Box sx={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #0066cc 0%, #00d4ff 100%)', borderRadius: '2px' }} />
      </Box>

      <Stack spacing={2}>
        {applications.length === 0 ? (
          <div>
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <Work sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', fontWeight: 600, mb: 1 }}>
                No applications yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Start applying to jobs to see your progress here
              </Typography>
            </Card>
          </div>
        ) : (
          applications.map((app, index) => {
            const statusColorInfo = getStatusColor(app.status);
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
              >
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 2px 12px ${statusColorInfo.color}18`,
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': { boxShadow: `0 8px 30px ${statusColorInfo.color}35` },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${statusColorInfo.color} 0%, ${statusColorInfo.color}99 100%)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              color: '#0066cc',
                              mb: 0.5,
                              fontSize: '1.15rem',
                            }}
                          >
                            {app.listing.company}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: '#333',
                              fontSize: '1rem',
                            }}
                          >
                            {app.listing.position}
                          </Typography>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs="auto">
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                              📍 {app.listing.location}
                            </Typography>
                          </Grid>
                          <Grid item xs="auto">
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                              💰 {app.listing.salary}
                            </Typography>
                          </Grid>
                          <Grid item xs="auto">
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                              📅 {new Date(app.date_applied).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.8,
                            px: 2,
                            py: 1,
                            backgroundColor: statusColorInfo.bg,
                            color: statusColorInfo.color,
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            border: `1px solid ${statusColorInfo.color}33`,
                          }}
                        >
                          {app.status === 'applied' && <AccessTime sx={{ fontSize: 18 }} />}
                          {app.status === 'interview' && <Phone sx={{ fontSize: 18 }} />}
                          {app.status === 'hired' && <CheckCircle sx={{ fontSize: 18 }} />}
                          {app.status === 'rejected' && <TrendingDown sx={{ fontSize: 18 }} />}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEdit(app)}
                            startIcon={<Edit />}
                            fullWidth
                            sx={{
                              borderRadius: '10px',
                              fontWeight: 600,
                              py: 1.2,
                            }}
                          >
                            Update
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(app.id)}
                            startIcon={<Delete />}
                            fullWidth
                            sx={{
                              borderRadius: '10px',
                              fontWeight: 600,
                              py: 1.2,
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{
        sx: {
          borderRadius: '16px',
        }
      }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 1 }}>
          Update Application Status
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 1, overflow: 'visible' }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: 600 }}>Status</InputLabel>
            <Select
              value={statusForm}
              onChange={(e) => setStatusForm(e.target.value)}
              label="Status"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="applied">Applied</MenuItem>
              <MenuItem value="interview">Interview</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="hired">Hired</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </motion.div>
  );
}

export default InsightsPage;
