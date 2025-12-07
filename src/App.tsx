import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import HelpPage from './pages/HelpPage';
import RequirementsPage from './pages/RequirementsPage';

function App() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px", direction: "rtl", minHeight: "80vh" }}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/help" element={<HelpPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;