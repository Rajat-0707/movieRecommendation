import React, { useEffect, useState } from "react";
import "./mainpage.css";
import { API_BASE } from "../apiBase";

function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const getItemKey = (item) => item?.Series_Title || item?.Title || item?.name;
  const isMovieItem = (item) => Boolean(item?.Series_Title);
  const isShowItem = (item) => Boolean(item?.Title) && !item?.Series_Title;
 

const fetchFavourites = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found");
      setLoading(false);
      return;
    }

    const res = await fetch(`${API_BASE}/favourite`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    setFavourites(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    fetchFavourites();
  }, []);

const handleRemoveFavourite = async (movie) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      return;
    }

    const res = await fetch(`${API_BASE}/favourite`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ item: movie }),
    });

    if (!res.ok) throw new Error("Failed to remove");

    setFavourites((prev) =>
      prev.filter((m) => getItemKey(m) !== getItemKey(movie))
    );
  } catch (err) {
    console.error(err);
    alert("Could not remove from favourites");
  }
};



  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  const movieFavourites = favourites.filter(isMovieItem);
  const showFavourites = favourites.filter(isShowItem);

  return (
    <div className="recommendations">
      {favourites.length === 0 ? (
        <p>No favourites yet ❤️</p>
      ) : (
        <>
          {movieFavourites.length > 0 && (
            <>
              <h2>Your Favourite Movies</h2>
              <div className="rec-container">
                {movieFavourites.map((movie, idx) => (
                  <div className="rec-card" key={`movie-${getItemKey(movie)}-${idx}`}>
                    <div className="info">
                      <img src={movie.Poster_Link} alt={movie.Series_Title} />
                      <h3>{movie.Series_Title}</h3>
                      <p>🎬 {movie.Director}</p>
                      <p>⭐ {movie.IMDB_Rating}</p>

                      <button
                        className="alwat fav-remove-btn"
                        onClick={() => handleRemoveFavourite(movie)}
                      >
                        Remove from Favourites ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {showFavourites.length > 0 && (
            <>
              <h2>Your Favourite TV Shows</h2>
              <div className="rec-container">
                {showFavourites.map((show, idx) => (
                  <div className="rec-card" key={`show-${getItemKey(show)}-${idx}`}>
                    <div className="info">
                      <h3>{show.Title}</h3>
                      {show["Release Year"] && <p>📅 Release Year: {show["Release Year"]}</p>}
                      {show.Genre && <p>🎭 Genre: {show.Genre}</p>}
                      {show.Rating && <p>⭐ IMDb Rating: {show.Rating}</p>}

                      <button
                        className="alwat fav-remove-btn"
                        onClick={() => handleRemoveFavourite(show)}
                      >
                        Remove from Favourites ❌
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

export default Favourites;
