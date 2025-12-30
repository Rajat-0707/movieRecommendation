import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "../apiBase";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [st, setSt] = useState(1);
  const [isUser, setIsUser] = useState(
    Boolean(localStorage.getItem("user"))
  );

  const getStyle = (id) => ({
    color: st === id ? "blue" : "black",
  });

  useEffect(() => {
    setIsUser(Boolean(localStorage.getItem("user")));
  }, [location.pathname]);

  const handleHomeClick = () => {
    window.scrollTo(0, 0);
    if (!isUser) {
      navigate("/");
    } else {
      navigate("/main");
    }
  };

  const handleAuthClick = async () => {
    if (isUser) {
      try {
        await fetch(`${API_BASE}/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("lastSearchQuery");
      setIsUser(false);
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="navbar">
      <div className="appTitle">RecommendationWebsite</div>

      <div className="navButtons">
        <button
          className="navButton"
          onClick={() => {
            handleHomeClick();
            setSt(1);
          }}
          style={getStyle(1)}
        >
          Home
        </button>

        {isUser && (
          <button
            className="navButton"
            onClick={() => {
              navigate("/favourite");
              setSt(2);
            }}
            style={getStyle(2)}
          >
            Favourite
          </button>
        )}

        {isUser && (
          <button
            className="navButton"
            onClick={() => {
              navigate("/watched");
              setSt(3);
            }}
            style={getStyle(3)}
          >
            Watched
          </button>
        )}

        <button className="navButton" onClick={handleAuthClick}>
          {isUser ? "Log Out" : "Log In"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
