import Navbar from './components/navbar';
import Home from './components/home';
import Login from './components/login';
import Signup from './components/signup';
import Mainpage from './components/mainPage';
import './App.css'
import './components/mainpage.css'
import './components/navbar.css'
import './overrides.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Favourite from "./components/favourite";
import Watched from "./components/watched";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/main" element={<Mainpage />} />
        <Route path="/favourite" element={<Favourite />} />
        <Route path="/watched" element={<Watched />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
