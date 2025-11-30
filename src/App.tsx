import Header from "./components/Header";
import Footer from "./components/Footer";
// 1. הוספנו את הייבוא של הטבלה
import CourseTable from "./components/CourseTable"; 

function App() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px", direction: "rtl" }}> {/* הוספתי direction: rtl כדי שייראה טוב בעברית */}
        <h2>ברוכים הבאים למערכת המידע למועמדים!</h2>
        <p>
          כאן תוכלו לנהל, לצפות ולעדכן נתונים של מועמדים למסלול מדעי המחשב.
        </p>

        {/* 2. הוספנו את הקומפוננטה עצמה כאן עם קצת מרווח מעל */}
        <div style={{ marginTop: "30px" }}>
          <CourseTable />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;