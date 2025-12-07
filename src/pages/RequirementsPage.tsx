import React, { useState } from 'react';
import { 
    Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    FormControlLabel, Switch, Stack 
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material/Select';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function RequirementsPage() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('');
    const [minScore, setMinScore] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [order, setOrder] = useState('0');
    const [isMandatory, setIsMandatory] = useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = () => {
        const newRequirement = {
            type, title, minScore, description, extraInfo, order, isMandatory
        };
        alert('הדרישה נשמרה:\n' + JSON.stringify(newRequirement, null, 2));
        setOpen(false);
    };

    return (
        <Box sx={{ padding: 3 }}>
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

            <Typography variant="body1" color="text.secondary">
                כאן יוצגו דרישות הקבלה הקיימות במערכת...
            </Typography>

            <Dialog open={open} onClose={handleClose} dir="rtl" fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                    הוספת דרישת קבלה חדשה
                </DialogTitle>
                
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
                        
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 2 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>סוג הדרישה</InputLabel>
                                    <Select
                                        value={type}
                                        label="סוג הדרישה"
                                        onChange={(e: SelectChangeEvent) => setType(e.target.value)}
                                    >
                                        <MenuItem value="bagrut">תעודת בגרות</MenuItem>
                                        <MenuItem value="psychometric">פסיכומטרי</MenuItem>
                                        <MenuItem value="english">אנגלית (אמיר"ם/אמיר)</MenuItem>
                                        <MenuItem value="other">אחר</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            
                            <Box sx={{ flex: 1 }}>
                                <TextField 
                                    label="ציון מינימום" 
                                    required 
                                    fullWidth
                                    value={minScore}
                                    onChange={(e) => setMinScore(e.target.value)}
                                />
                            </Box>
                        </Stack>

                        <TextField 
                            label="כותרת הדרישה" 
                            required 
                            fullWidth 
                            placeholder="לדוגמה: זכאות לבגרות מלאה"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <TextField
                            label="תיאור הדרישה"
                            multiline
                            rows={2}
                            fullWidth
                            placeholder="הסבר קצר על מהות הדרישה..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <TextField
                            label="מידע נוסף"
                            multiline
                            rows={2}
                            fullWidth
                            placeholder="פרטים משלימים (למשל מקרים חריגים)..."
                            value={extraInfo}
                            onChange={(e) => setExtraInfo(e.target.value)}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TextField 
                                label="סדר תצוגה" 
                                type="number" 
                                sx={{ width: '150px' }}
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={isMandatory}
                                        onChange={(e) => setIsMandatory(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="דרישת חובה להרשמה?"
                            />
                        </Box>

                    </Box>
                </DialogContent>

                <DialogActions sx={{ padding: 3, justifyContent: 'space-between' }}>
                    <Button onClick={handleClose} color="inherit" variant="outlined">ביטול</Button>
                    <Button onClick={handleSubmit} color="success" variant="contained" size="large">
                        שמור דרישה
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}