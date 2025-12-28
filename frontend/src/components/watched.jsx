import React, { useEffect, useState } from "react";
import "./mainpage.css";
import { API_BASE } from "../apiBase";

function Watched() {
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);

  const getItemKey = (item) => item?.Series_Title || item?.Title || item?.name;
  const isMovieItem = (item) => Boolean(item?.Series_Title);
  const isShowItem = (item) => Boolean(item?.Title) && !item?.Series_Title;

  // 🔑 fetch watched list
  const fetchWatched = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/watched`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setWatched(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatched();
  }, []);

  // 🔑 remove watched movie
  const handleRemoveWatched = async (movie) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again");
        return;
      }

      const res = await fetch(`${API_BASE}/watched`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item: movie }),
      });

      if (!res.ok) throw new Error("Failed to remove");

      setWatched((prev) =>
        prev.filter((m) => getItemKey(m) !== getItemKey(movie))
      );
    } catch (err) {
      console.error(err);
      alert("Could not remove from watched");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  const movieWatched = watched.filter(isMovieItem);
  const showWatched = watched.filter(isShowItem);

  return (
    <div className="recommendations">
      {watched.length === 0 ? (
        <p>No watched items yet 👀</p>
      ) : (
        <>
          {movieWatched.length > 0 && (
            <>
              <h2>Watched Movies</h2>
              <div className="rec-container">
                {movieWatched.map((movie, idx) => (
                  <div className="rec-card" key={`movie-${getItemKey(movie)}-${idx}`}>
                    <div className="info">
                      <img src={movie.Poster_Link} alt={movie.Series_Title} />
                      <h3>{movie.Series_Title}</h3>
                      <p>🎬 {movie.Director}</p>
                      <p>⭐ {movie.IMDB_Rating}</p>

                      <button
                        className="addfav watched-remove-btn"
                        onClick={() => handleRemoveWatched(movie)}
                      >
                        Remove from Watched ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {showWatched.length > 0 && (
            <>
              <h2>Watched TV Shows</h2>
              <div className="rec-container">
                {showWatched.map((show, idx) => (
                  <div className="rec-card" key={`show-${getItemKey(show)}-${idx}`}>
                    <div className="info">
                      <h3>{show.Title}</h3>
                      {show["Release Year"] && <p>📅 Release Year: {show["Release Year"]}</p>}
                      {show.Genre && <p>🎭 Genre: {show.Genre}</p>}
                      {show.Rating && <p>⭐ IMDb Rating: {show.Rating}</p>}

                      <button
                        className="addfav watched-remove-btn"
                        onClick={() => handleRemoveWatched(show)}
                      >
                        Remove from Watched ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Watched;
