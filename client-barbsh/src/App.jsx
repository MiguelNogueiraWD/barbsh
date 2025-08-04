/* import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App*/ 

/*function App() {
  return (
    <div className="text-2xl font-bold text-center text-blue-500 mt-10">
       Tailwind fonctionne !
    </div>
  );
}

export default App;*/


import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import Moderation from "./pages/Moderation";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStats from "./pages/AdminStats";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Messages from './pages/Messages';
import SentMessages from './pages/SentMessages';
import NewMessage from './pages/NewMessage';
import MapServices from './pages/MapServices';
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/map" element={<MapServices />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/bookings/:id" element={<PrivateRoute><BookingForm /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/moderation" element={<PrivateRoute><Moderation /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/stats" element={<PrivateRoute><AdminStats /></PrivateRoute>} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/sent" element={<PrivateRoute><SentMessages /></PrivateRoute>} />
        <Route path="/messages/new" element={<PrivateRoute><NewMessage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/services" />} />

      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
