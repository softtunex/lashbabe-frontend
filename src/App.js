// src/App.js
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer"; // Import Footer
import Homepage from "./pages/Homepage/Homepage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import AcademyPage from "./pages/AcademyPage/AcademyPage";
import AboutPage from "./pages/AboutPage/AboutPage"; // Import AboutPage
import ContactPage from "./pages/ContactPage/ContactPage"; // Import ContactPage

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/booking/:serviceId" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />{" "}
          {/* Add About route */}
          <Route path="/contact" element={<ContactPage />} />{" "}
          {/* Add Contact route */}
        </Routes>
      </main>
      <Footer /> {/* Add Footer */}
    </div>
  );
}

export default App;
