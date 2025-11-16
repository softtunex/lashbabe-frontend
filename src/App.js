// src/App.js
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Homepage from "./pages/Homepage/Homepage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import BookingPage from "./pages/BookingPage/BookingPage"; // Import BookingPage

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking/:serviceId" element={<BookingPage />} />{" "}
          {/* Add this route */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
