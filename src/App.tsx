import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";

// ייבוא העמודים
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import HelpPage from './pages/HelpPage';
import RequirementsPage from './pages/RequirementsPage'; // 1. הייבוא החדש

function App() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px", direction: "rtl", minHeight: "80vh" }}>
        
        <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/courses" element={<CoursesPage />} />
            
            {/* 2. הנתיב החדש לדף דרישות קבלה */}
            <Route path="/requirements" element={<RequirementsPage />} />
            
            <Route path="/help" element={<HelpPage />} />
        </Routes>

      </main>

      <Footer />
    </>
  );
}

export default App;