import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";

// ייבוא העמודים שיצרנו הרגע
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <>
      <Header />

      {/* אזור התוכן הראשי שמשתנה לפי הניווט */}
      <main style={{ padding: "20px", direction: "rtl", minHeight: "80vh" }}>
        
        <Routes>
            {/* נתיב לדף הבית */}
            <Route path="/" element={<HomePage />} />
            
            {/* נתיב לדף ניהול קורסים */}
            <Route path="/courses" element={<CoursesPage />} />
            
            {/* נתיב לדף עזרה */}
            <Route path="/help" element={<HelpPage />} />
        </Routes>

      </main>

      <Footer />
    </>
  );
}

export default App;