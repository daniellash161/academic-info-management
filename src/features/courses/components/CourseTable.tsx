import React, { useState, useEffect } from 'react';
import { Course } from '../models/Course';

const CourseTable: React.FC = () => {
    
    // State ששומר את רשימת הקורסים שלי
    const [courses, setCourses] = useState<Course[]>([]);

    // טעינת נתונים מהזיכרון כשהדף עולה (רץ פעם אחת)
    useEffect(() => {
        const savedData = localStorage.getItem('courses-data');
        if (savedData) {
            setCourses(JSON.parse(savedData));
        }
    }, []);

    // פונקציה להוספת קורס (סתם נתונים אקראיים בשביל התרגיל)
    const addRandomCourse = () => {
        
        // מאגר נתונים להגרלה
        const courseTypes = [
            { name: 'מבוא למדעי המחשב', code: 'CS101', credits: 5, syl: 'יסודות התכנות בשפת Java' },
            { name: 'מבני נתונים', code: 'CS202', credits: 4, syl: 'רשימות מקושרות, עצים וגרפים' },
            { name: 'אלגוריתמים', code: 'CS301', credits: 4, syl: 'סיבוכיות ובעיות NP' },
            { name: 'מסדי נתונים', code: 'DB101', credits: 3, syl: 'שפת SQL ותכנון סכמות' },
            { name: 'מערכות הפעלה', code: 'OS100', credits: 4, syl: 'ניהול זיכרון בלינוקס' }
        ];

        const lecturers = ['ד"ר כהן', 'פרופ\' לוי', 'ד"ר אברהמי', 'גב\' שמש', 'מר קוזניאק'];
        const semesters = ['א\'', 'ב\'', 'קיץ'];
        const prereqOptions = ['אין', 'מבוא למדמ"ח', 'מתמטיקה בדידה', 'מבני נתונים'];

        // מגרילה נתונים
        const randomType = courseTypes[Math.floor(Math.random() * courseTypes.length)];
        const uniqueCode = randomType.code + '-' + Math.floor(Math.random() * 999); // כדי שלא יהיה אותו ID פעמיים
        const randomSemester = semesters[Math.floor(Math.random() * semesters.length)];
        const randomLecturer = lecturers[Math.floor(Math.random() * lecturers.length)];
        const randomPrereq = prereqOptions[Math.floor(Math.random() * prereqOptions.length)];

        // יוצרת אובייקט חדש מהמחלקה Course
        const newCourse = new Course(
            uniqueCode,          
            randomType.name,     
            randomSemester,      
            randomType.credits,  
            randomType.syl,      
            randomLecturer,      
            randomPrereq         
        );

        // מעדכנת את ה-State (מוסיפה את החדש לרשימה הקיימת)
        setCourses(prev => [...prev, newCourse]);
    };

    // שמירה ל-LocalStorage
    const saveData = () => {
        localStorage.setItem('courses-data', JSON.stringify(courses));
        alert('נשמר!');
    };

    // ניקוי הטבלה והזיכרון (כפתור איפוס)
    const clearData = () => {
        setCourses([]);
        localStorage.removeItem('courses-data');
    };

    return (
        <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'Arial' }}>
            <h1>ניהול קורסים</h1>
            
            {/* כפתורי שליטה */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={addRandomCourse}>+ הוסף קורס</button>
                <button onClick={saveData} style={{ margin: '0 10px' }}>💾 שמור</button>
                <button onClick={clearData}>🗑️ נקה הכל</button>
            </div>

            {/* טבלת הקורסים */}
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr style={{ backgroundColor: '#eee' }}>
                        <th>קוד</th>
                        <th>שם הקורס</th>
                        <th>סמסטר</th>
                        <th>נק"ז</th>
                        <th>מרצה</th>
                        <th>סילבוס</th>
                        <th>דרישות קדם</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.code}>
                            <td>{course.code}</td>
                            <td>{course.name}</td>
                            <td>{course.semester}</td>
                            <td>{course.credits}</td>
                            <td>{course.lecturer}</td>
                            <td>{course.syllabus}</td>
                            <td>{course.prerequisites}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CourseTable;