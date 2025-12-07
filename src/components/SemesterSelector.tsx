import React, { useState } from 'react';
// 1. ייבוא הרכיבים מ-Material UI
import { FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from '@mui/material';

export default function SemesterSelector() {
  // 2. ניהול ה-State: כאן נשמר הערך שהמשתמש בחר
  const [semester, setSemester] = useState('');

  // 3. הפונקציה שמופעלת כשבוחרים משהו מהרשימה
  const handleChange = (event: SelectChangeEvent) => {
    setSemester(event.target.value); // מעדכן את ה-State
  };

  return (
    // עיצוב קטן כדי שייראה טוב בצילום מסך למצגת
    <div style={{ maxWidth: '300px', padding: '20px', backgroundColor: 'white' }}>
      
      {/* FormControl: העוטף שאחראי על העיצוב והנגישות */}
      <FormControl fullWidth>
        
        {/* הכותרת של השדה ("בחר סמסטר") */}
        <InputLabel id="demo-simple-select-label">בחר סמסטר</InputLabel>
        
        {/* רכיב ה-Select עצמו */}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={semester} // מקושר ל-State
          label="בחר סמסטר" // חשוב כדי שהקו ייחתך יפה למעלה
          onChange={handleChange} // מקושר לפונקציה
        >
          {/* רשימת האפשרויות (Items) */}
          <MenuItem value={'A'}>סמסטר א'</MenuItem>
          <MenuItem value={'B'}>סמסטר ב'</MenuItem>
          <MenuItem value={'Summer'}>סמסטר קיץ</MenuItem>
        </Select>
      </FormControl>

      {/* בונוס: מציג למטה מה נבחר כדי לראות שזה עובד */}
      <p style={{ marginTop: '10px' }}>בחירה נוכחית: {semester}</p>
    </div>
  );
}