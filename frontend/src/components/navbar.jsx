import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API_BASE } from '../apiBase';

function Navbar() {
  const navigate = useNavigate();

  const [isUser, setIsUser] = useState(
    Boolean(localStorage.getItem('user'))
  );
  const location = useLocation();
  useEffect(() => {
    setIsUser(Boolean(localStorage.getItem('user')));
  }, [location.pathname]);
  const handleHomeClick = () => {
    window.scrollTo(0, 0);
    {!isUser && navigate('/');}
    navigate('/main');
  };

  

  const handleAuthClick = async () => {
    if (isUser) {
      try {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch {}
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('lastSearchQuery');
      setIsUser(false);
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="navbar">
      <div className="appTitle">RecommendationWebsite</div>

      <div className="navButtons">
        <button className="navButton" onClick={handleHomeClick}>
          Home
        </button>
        {isUser && (
        <button onClick={() => {navigate('/favourite'); }}
          // disabled={!isUser}
          className="navButton">
          Favourite
        </button>
        )}

        {isUser && (
        <button onClick={() => navigate('/watched')} className="navButton" disabled={!isUser}>
          Watched
        </button>
        )}

        <button className="navButton" onClick={handleAuthClick}>
          {isUser ? 'Log Out' : 'Log In'}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
