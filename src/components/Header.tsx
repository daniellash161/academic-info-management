import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setOpen(false);
    };

    const menuItems = [
        { text: 'דף הבית', icon: <HomeIcon />, path: '/' },
        { text: 'מועמדים', icon: <GroupIcon />, path: '/' },
        { text: 'בקשות הרשמה', icon: <AssignmentIcon />, path: '/' },
        { text: 'ניהול קורסים', icon: <SchoolIcon />, path: '/courses' },
        { text: 'דרישות קבלה', icon: <VerifiedUserIcon />, path: '/requirements' },
        { text: 'עזרה', icon: <HelpIcon />, path: '/help' },
    ];

    return (
        <>
            <AppBar position="static" color="default" sx={{ backgroundColor: '#fff', color: '#333' }}>
                <Toolbar sx={{ direction: 'rtl' }}>
                    
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer}
                        sx={{ marginLeft: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        מערכת מידע למועמדים
                    </Typography>

                    <IconButton color="error" onClick={() => alert('התנתקת מהמערכת')}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={open} onClose={toggleDrawer}>
                <Box sx={{ width: 250 }} role="presentation">
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton onClick={() => handleNavigation(item.path)}>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.text} 
                                        sx={{ textAlign: 'right' }} 
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}