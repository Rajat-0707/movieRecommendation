import React, { useEffect, useState } from "react";
import "./mainpage.css";
import { API_BASE } from "../apiBase";

function Mainpage() {

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

 
const handleAddFavourite = async (item) => {
  if (!user) {
    alert("Please login");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token missing. Please login again.");
    return;
  }

  const key = getItemKey(item);
  const isFav = favourites.has(key);

  try {
    await fetch(`${API_BASE}/favourite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ THIS IS THE FIX
      },
      body: JSON.stringify({
        item,
        action: isFav ? "remove" : "add",
      }),
    });

    setFavourites((prev) => {
      const updated = new Set(prev);
      isFav ? updated.delete(key) : updated.add(key);
      return updated;
    });
  } catch (err) {
    console.error(err);
    alert("Failed to update favourites");
  }
};

 const handleAddWatched = async (item) => {
  if (!user) {
    alert("Please login");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token missing. Please login again.");
    return;
  }

  const key = getItemKey(item);
  const isWatched = watched.has(key);

  try {
    await fetch(`${API_BASE}/watched`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ REQUIRED
      },
      body: JSON.stringify({
        item,
        action: isWatched ? "remove" : "add",
      }),
    });

    setWatched((prev) => {
      const updated = new Set(prev);
      isWatched ? updated.delete(key) : updated.add(key);
      return updated;
    });
  } catch (err) {
    console.error(err);
    alert("Failed to update watched");
  }
};


  const handleSearch = () => {
    // if (!user) {
    //   alert("Please login");
    //   return;
    // }

    if (active === 1) fetchRecommendations(query);
    if (active === 2) fetchRecommendationsTVshow(query);
    if (active === 3) fetchRecommendationsActor(query);
    if (active === 4) fetchRecommendationsDirector(query);
    if (active === 5) fetchRecommendationsGenre(query);
  };


  const [active, setActive] = useState(1);
  const [placeholder, setPlaceholder] = useState("Movie");
  const [favourites, setFavourites] = useState(new Set());
  const [watched, setWatched] = useState(new Set());



  const getItemKey = (item) => {
    return (
      item.Series_Title ||
      item.Title ||
      item.name
    );
  };


  // 🔹 NEW STATES
const [query, setQuery] = useState(
  () => localStorage.getItem("lastSearchQuery") || ""
);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    setRecommendations([]);
    // setQuery("");
  }, [active]);

  useEffect(() => {
    localStorage.setItem("lastSearchQuery", query);
  }, [query]);


  const getStyle = (id) => ({
    backgroundColor: active === id ? "blue" : "white",
    color: active === id ? "white" : "black",
  });


  const searchEndpointMap = {
    1: "movie",
    2: "show",
    3: "actor",
    4: "director",
    5: "genre",
  };


  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const endpoint = searchEndpointMap[active];
    if (!endpoint) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/search/${endpoint}?q=${encodeURIComponent(query)}`
        );

        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Autocomplete error:", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, active, user]);


  // 🔹 FETCH RECOMMENDATIONS
  const fetchRecommendations = async (movieName) => {
    if (active !== 1) return;

    setShowDropdown(false);

    try {
      const name = (movieName || "").trim();
      if (!name) return;
      const res = await fetch(`${API_BASE}/recommend/movie/${encodeURIComponent(name)}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendationsTVshow = async (showName) => {
    if (active !== 2) return;

    setShowDropdown(false);

    try {
      const sname = (showName || "").trim();
      if (!sname) return;

      const res = await fetch(
        `${API_BASE}/recommend/show/${encodeURIComponent(sname)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await res.json();

      // ✅ extract recommendations correctly
      setRecommendations(
        Array.isArray(data.recommendations)
          ? data.recommendations
          : []
      );

    } catch (err) {
      console.error("TV Show Recommendation Error:", err);
      setRecommendations([]);
    }
  };

  const fetchRecommendationsDirector = async (directorName) => {
    if (active !== 4) return;

    setShowDropdown(false);

    try {
      const dirname = (directorName || "").trim();
      if (!dirname) return;
      const res = await fetch(`${API_BASE}/recommend/director/${encodeURIComponent(dirname)}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchRecommendationsActor = async (actorName) => {
    if (active !== 3) return;

    setShowDropdown(false);

    try {
      const actname = (actorName || "").trim();
      if (!actname) return;
      const res = await fetch(`${API_BASE}/recommend/actor/${encodeURIComponent(actname)}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchRecommendationsGenre = async (genreName) => {
    if (active !== 5) return;

    setShowDropdown(false);

    try {
      const genname = (genreName || "").trim();
      if (!genname) return;
      const res = await fetch(`${API_BASE}/recommend/genre/${encodeURIComponent(genname)}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  const fetchFavourites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/favourite`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // convert array → Set
      const favSet = new Set(
        (Array.isArray(data) ? data : []).map(getItemKey)
      );

      setFavourites(favSet);
    } catch (err) {
      console.error("Fetch favourites failed", err);
    }
  };

  fetchFavourites();
}, []);


useEffect(() => {
  const fetchWatched = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/watched`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const watchedSet = new Set(
        (Array.isArray(data) ? data : []).map(getItemKey)
      );

      setWatched(watchedSet);
    } catch (err) {
      console.error("Fetch watched failed", err);
    }
  };

  fetchWatched();
}, []);


  return (
    <>
      {/* SELECTION BAR */}
      <div className="selectionNavbar">
        <div className="selectionButtons">
          <button
            className="selectionButton"
            onClick={() => { setActive(1); setPlaceholder("Movie"); }}
            style={getStyle(1)}
          >
            Movie
          </button>
          <button
            className="selectionButton"
            onClick={() => { setActive(2); setPlaceholder("TV Show"); }}
            style={getStyle(2)}
          >
            TV Show
          </button>
          <button
            className="selectionButton"
            onClick={() => { setActive(3); setPlaceholder("Actor"); }}
            style={getStyle(3)}
          >
            Actors
          </button>
          <button
            className="selectionButton"
            onClick={() => { setActive(4); setPlaceholder("Director"); }}
            style={getStyle(4)}
          >
            Directors
          </button>
          <button
            className="selectionButton"
            onClick={() => { setActive(5); setPlaceholder("Genre"); }}
            style={getStyle(5)}
          >
            Genres
          </button>
        </div>
        {/* <button
          className="themeToggleBtn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button> */}
      </div>

      {/* SEARCH INPUT */}
      <form
        className="recomm"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <div className="searchBox">
          <input
            className="searchInput"
            type="text"
            value={query}
            placeholder={`Enter your favourite ${placeholder}`}
            onChange={(e) => setQuery(e.target.value)}
            // disabled={!user}
            // onBlur={(e) => {
            //   if (!e.currentTarget.contains(e.relatedTarget)) {
            //     setTimeout(() => setShowDropdown(false), 150);
            //   }
            // }}
          />

          {/* AUTOCOMPLETE DROPDOWN */}
          {showDropdown && suggestions.length > 0 && (
            <ul className="autocomplete-dropdown">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onMouseDown={() => {
                    setQuery(item);
                    setShowDropdown(false);

                    if (active === 1) fetchRecommendations(item);
                    if (active === 2) fetchRecommendationsTVshow(item);
                    if (active === 3) fetchRecommendationsActor(item);
                    if (active === 4) fetchRecommendationsDirector(item);
                    if (active === 5) fetchRecommendationsGenre(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>

          )}
        </div>

        <button
          type="submit"
          className="searchButton"
        // disabled={!user}
        >
          Search
        </button>
      </form>


      {/* RECOMMENDATIONS */}
      <div className="recommendations">
        {active === 1 && recommendations.length > 0 && (
          <>
            <h2>Recommendations for you</h2>
            <div className="rec-container">
              {recommendations.map((movie, idx) => (
                <div className="rec-card" key={idx}>
                  <div className="info">
                    <img src={movie.Poster_Link} alt="" />
                    <h3>{movie.Series_Title}</h3>
                    <p>🎬 {movie.Director}</p>
                    <p>⭐ {movie.IMDB_Rating}</p>
                    <div className="buttt">
                      <button
                        className="addfav"
                        onClick={() => handleAddFavourite(movie)}
                      >
                        {favourites.has(getItemKey(movie))
                          ? "Added to Favourites ❤️"
                          : "Add to Favourites"}
                      </button>

                      <button
                        className="alwat"
                        onClick={() => handleAddWatched(movie)}
                      >
                        {watched.has(getItemKey(movie))
                          ? "Watched ✅"
                          : "Already Watched"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="tv-results-wrapper">
        {active === 2 && recommendations.length > 0 && (
          <>
            <h2 className="tv-results-heading">Recommended TV Shows</h2>

            <div className="tv-cards-grid">
              {recommendations.map((show, idx) => (
                <div className="tv-card" key={idx}>
                  <div className="tv-card-content">
                    <h3 className="tv-show-title">{show.Title}</h3>

                    <p className="tv-show-year">
                      📅 Release Year: {show["Release Year"]}
                    </p>

                    <p className="tv-show-rating">
                      ⭐ IMDb Rating: {show.Rating}
                    </p>

                    <div className="tv-card-actions">
                      <button
                        className="addfav"
                        onClick={() => handleAddFavourite(show)}
                      >
                        {favourites.has(getItemKey(show))
                          ? "Added to Favourites ❤️"
                          : "Add to Favourites"}
                      </button>

                      <button
                        className="alwat"
                        onClick={() => handleAddWatched(show)}
                      >
                        {watched.has(getItemKey(show))
                          ? "Watched ✅"
                          : "Already Watched"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="tv-results-wrapper">
        {active === 5 && recommendations.length > 0 && (
          <>
            <h2 className="tv-results-heading">Movies by Genre</h2>

            <div className="tv-cards-grid">
              {recommendations.map((movie, idx) => (
                <div className="tv-card" key={idx}>
                  <div className="tv-card-content">
                    <img
                      src={movie.Poster_Link}
                      alt={movie.Series_Title}
                      className="tv-card-poster"
                    />

                    <h3 className="tv-show-title">{movie.Series_Title}</h3>

                    <p className="tv-show-year">
                      🎬 Director: {movie.Director}
                    </p>

                    <p className="tv-show-rating">
                      ⭐ IMDb Rating: {movie.IMDB_Rating}
                    </p>

                    <div className="tv-card-actions">
                      <button
                        className="addfav"
                        onClick={() => handleAddFavourite(movie)}
                      >
                        {favourites.has(getItemKey(movie))
                          ? "Added to Favourites ❤️"
                          : "Add to Favourites"}
                      </button>

                      <button
                        className="alwat"
                        onClick={() => handleAddWatched(movie)}
                      >
                        {watched.has(getItemKey(movie))
                          ? "Watched ✅"
                          : "Already Watched"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>


      <div className="tv-results-wrapper">
        {active === 4 && recommendations.length > 0 && (
          <>
            <h2 className="tv-results-heading">Movies by Director</h2>

            <div className="tv-cards-grid">
              {recommendations.map((movie, idx) => (
                <div className="tv-card" key={idx}>
                  <div className="tv-card-content">
                    <img
                      src={movie.Poster_Link}
                      alt={movie.Series_Title}
                      className="tv-card-poster"
                    />

                    <h3 className="tv-show-title">{movie.Series_Title}</h3>

                    <p className="tv-show-year">
                      🎬 Director: {movie.Director}
                    </p>

                    <p className="tv-show-rating">
                      ⭐ IMDb Rating: {movie.IMDB_Rating}
                    </p>

                    <div className="tv-card-actions">
                      <button
                        className="addfav"
                        onClick={() => handleAddFavourite(movie)}
                      >
                        {favourites.has(getItemKey(movie))
                          ? "Added to Favourites ❤️"
                          : "Add to Favourites"}
                      </button>

                      <button
                        className="alwat"
                        onClick={() => handleAddWatched(movie)}
                      >
                        {watched.has(getItemKey(movie))
                          ? "Watched ✅"
                          : "Already Watched"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>


      <div className="tv-results-wrapper">
        {active === 3 && recommendations.length > 0 && (
          <>
            <h2 className="tv-results-heading">Movies by Actor</h2>

            <div className="tv-cards-grid">
              {recommendations.map((movie, idx) => (
                <div className="tv-card" key={idx}>
                  <div className="tv-card-content">
                    <img
                      src={movie.Poster_Link}
                      alt={movie.Series_Title}
                      className="tv-card-poster"
                    />

                    <h3 className="tv-show-title">{movie.Series_Title}</h3>

                    <p className="tv-show-year">
                      🎬 Director: {movie.Director}
                    </p>

                    <p className="tv-show-rating">
                      ⭐ IMDb Rating: {movie.IMDB_Rating}
                    </p>

                    <div className="tv-card-actions">
                      <button
                        className="addfav"
                        onClick={() => handleAddFavourite(movie)}
                      >
                        {favourites.has(getItemKey(movie))
                          ? "Added to Favourites ❤️"
                          : "Add to Favourites"}
                      </button>
                      <button
                        className="alwat"
                        onClick={() => handleAddWatched(movie)}
                      >
                        {watched.has(getItemKey(movie))
                          ? "Watched ✅"
                          : "Already Watched"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>




    </>
  );
}

export default Mainpage;
