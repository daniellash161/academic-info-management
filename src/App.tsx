import Header from "./components/Header";
import Footer from "./components/Footer";
import CourseTable from "./features/courses/components/CourseTable"; 

function App() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px", direction: "rtl" }}> 
        <h2>ברוכים הבאים למערכת המידע למועמדים!</h2>
        <p>
          כאן תוכלו לנהל, לצפות ולעדכן נתונים של מועמדים למסלול מדעי המחשב.
        </p>
        <div style={{ marginTop: "30px" }}>
          <CourseTable />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;