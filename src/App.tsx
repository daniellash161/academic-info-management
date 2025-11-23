import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Header />

      <main style={{ padding: "20px" }}>
        <h2>ברוכים הבאים למערכת המידע למועמדים!</h2>
        <p>
          כאן תוכלו לנהל, לצפות ולעדכן נתונים של מועמדים למסלול מדעי המחשב.
        </p>
      </main>

      <Footer />
    </>
  );
}

export default App;