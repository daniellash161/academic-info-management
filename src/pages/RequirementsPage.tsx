import React, { useState } from 'react';
import { 
    Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, 
    Dialog, DialogTitle, DialogContent, DialogActions, type SelectChangeEvent 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function RequirementsPage() {
    // מצב החלון הקופץ (פתוח/סגור)
    const [open, setOpen] = useState(false);

    // סטייט של הטופסס
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [score, setScore] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        alert(`נוספה דרישה: ${name}, ${type}, ${score}`);
        setOpen(false); // סוגר את החלון אחרי השמירה
    };

    return (
        <Box sx={{ padding: 3 }}>
            {/* הכותרת והכפתור כמו בתמונה ששלחת */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    🎓 ניהול דרישות קבלה
                </Typography>
                
                <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<AddCircleIcon />} 
                    onClick={handleClickOpen}
                    size="large"
                >
                    הוספת דרישה חדשה +
                </Button>
            </Box>

            {/* כאן תהיה הטבלה או הרשימה של הדרישות הקיימות */}
            <Typography variant="body1" color="text.secondary">
                כאן יוצגו דרישות הקבלה הקיימות במערכת...
            </Typography>

            {/* --- החלון הקופץ (Dialog) --- */}
            <Dialog open={open} onClose={handleClose} dir="rtl" fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>הוספת דרישת קבלה חדשה</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>סוג הדרישה *</InputLabel>
                            <Select
                                value={type}
                                label="סוג הדרישה *"
                                onChange={(e: SelectChangeEvent) => setType(e.target.value)}
                            >
                                <MenuItem value="bagrut">בגרות</MenuItem>
                                <MenuItem value="psychometric">פסיכומטרי</MenuItem>
                                <MenuItem value="english">אנגלית</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField 
                            label="כותרת הדרישה *" 
                            fullWidth 
                            placeholder="לדוגמה: תעודת בגרות מלאה"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <TextField 
                            label="ציון מינימלי" 
                            fullWidth 
                            type="number"
                            placeholder="לדוגמה: 85, רמה 4"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                        />
                        
                        <TextField
                            label="תיאור מפורט *"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="תיאור מפורט של הדרישה..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ padding: 2, gap: 1 }}>
                    <Button onClick={handleClose} color="inherit" variant="outlined">ביטול</Button>
                    <Button onClick={handleSubmit} color="success" variant="contained">שמור דרישה</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}