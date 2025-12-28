import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Movie Recommendation Website</h1>
        <p>Discover your next favorite movie, TV show, or explore by directors and genres</p>
        <div className="cta-buttons">
          <Link to="/main" className="cta-primary">Get Started</Link>
          <Link to="/login" className="cta-secondary">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;