from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np

app = FastAPI()

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df = pd.read_csv(os.path.join(BASE_DIR, "imdb_top_1000.csv"))
dfshow = pd.read_csv(os.path.join(BASE_DIR, "action_series1.csv"))


dfshow = dfshow.dropna(subset=["Title", "Genre", "Rating"])

dfshow["Title"] = dfshow["Title"].str.strip().str.lower()
dfshow["Genre"] = dfshow["Genre"].str.lower()
dfshow["Cast"] = dfshow["Cast"].fillna("").str.lower()
dfshow["Rating"] = pd.to_numeric(dfshow["Rating"], errors="coerce")

dfshow = dfshow.dropna(subset=["Rating"])
dfshow["Genre_List"] = dfshow["Genre"].apply(lambda x: [g.strip() for g in x.split(",")])
dfshow["Cast_List"] = dfshow["Cast"].apply(lambda x: [c.strip() for c in x.split(",") if c.strip() != ""])

# Normalize votes
dfshow["Number of Votes"] = pd.to_numeric(dfshow["Number of Votes"], errors="coerce").fillna(0)






df = df.dropna(subset=["Series_Title", "Genre", "Director", "IMDB_Rating", "No_of_Votes"])
df["No_of_Votes"] = pd.to_numeric(df["No_of_Votes"], errors="coerce")
df = df.dropna(subset=["No_of_Votes"])

C = df["IMDB_Rating"].mean()
m = df["No_of_Votes"].quantile(0.75)

def clean_genres(genre_str):
    return set(g.strip() for g in genre_str.split(",") if g.lower() != "drama")

def weighted_rating(row):
    v = row["No_of_Votes"]
    R = row["IMDB_Rating"]
    return (v/(v+m))*R + (m/(v+m))*C

df["score"] = df.apply(weighted_rating, axis=1)

@app.get("/")
def health():
    return {"status": "API running"}


@app.get("/search/actor")
def search_actor(q: str = ""):
    q = (q or "").strip().lower()
    if len(q) < 2:
        return []

    actors = set()

    for col in ["Star1", "Star2", "Star3", "Star4"]:
        actors.update(
            df[col][df[col].str.contains(q, na=False)].tolist()
        )

    actors = sorted(a for a in actors if a)

    # prioritize actors starting with q
    starts = [a for a in actors if a.startswith(q)]
    contains = [a for a in actors if not a.startswith(q)]

    return (starts + contains)[:10]


@app.get("/search/movie")
def search(q: str = ""):
    q = (q or "").strip().lower()
    if len(q) < 2:
        return []
    # prioritize titles that start with q, then those that contain q
    titles = df["Series_Title"].astype(str)
    starts = titles[titles.str.lower().str.startswith(q)]
    contains = titles[(~titles.str.lower().str.startswith(q)) & (titles.str.lower().str.contains(q))]
    res = list(starts.head(10))
    if len(res) < 10:
        res += list(contains.head(10 - len(res)))
    return res

@app.get("/search/show")
def search_show(q: str = ""):
    q = (q or "").strip().lower()
    if len(q) < 2:
        return []
    # prioritize titles that start with q, then those that contain q
    titles = dfshow["Title"].astype(str)
    starts = titles[titles.str.lower().str.startswith(q)]
    contains = titles[(~titles.str.lower().str.startswith(q)) & (titles.str.lower().str.contains(q))]
    res = list(starts.head(10))
    if len(res) < 10:
        res += list(contains.head(10 - len(res)))
    return res

@app.get("/search/director")
def search_director(q: str = ""):
    q = (q or "").strip().lower()
    if len(q) < 2:
        return []
    # get unique director names
    directors = df["Director"].dropna().unique()
    directors = [d for d in directors if q in d.lower()]
    # prioritize names that start with q
    starts = [d for d in directors if d.lower().startswith(q)]
    contains = [d for d in directors if not d.lower().startswith(q) and q in d.lower()]
    res = starts[:10]
    if len(res) < 10:
        res += contains[:10 - len(res)]
    return res

@app.get("/search/genre")
def search_genre(q: str = ""):
    q = (q or "").strip().lower()
    if len(q) < 2:
        return []
    # get unique genres from the genre column
    all_genres = set()
    for genres in df["Genre"].dropna():
        all_genres.update([g.strip().lower() for g in genres.split(",")])
    
    # filter genres that contain q
    matching_genres = [g for g in all_genres if q in g]
    # prioritize genres that start with q
    starts = [g for g in matching_genres if g.startswith(q)]
    contains = [g for g in matching_genres if not g.startswith(q)]
    res = starts[:10]
    if len(res) < 10:
        res += contains[:10 - len(res)]
    return res

@app.get("/recommend/movie")
def recommend(movie: str):
    movie_row = df[df["Series_Title"].str.lower() == movie.lower()]
    if movie_row.empty:
        return {"error": "Movie not found"}

    target_genres = clean_genres(movie_row.iloc[0]["Genre"])
    target_director = movie_row.iloc[0]["Director"]

    same_director = df[
        (df["Director"] == target_director) &
        (df["Genre"].apply(lambda g: len(target_genres & clean_genres(g)) > 0))
    ]

    same_director = same_director[same_director["Series_Title"].str.lower() != movie.lower()]
    same_director = same_director.sort_values("score", ascending=False)

    if len(same_director) < 10:
        same_genre = df[
            (df["Director"] != target_director) &
            (df["Genre"].apply(lambda g: len(target_genres & clean_genres(g)) > 0))
        ]
        same_genre = same_genre[same_genre["Series_Title"].str.lower() != movie.lower()]
        same_genre = same_genre.sort_values("score", ascending=False)

        recs = pd.concat([same_director, same_genre]).drop_duplicates("Series_Title")
    else:
        recs = same_director

    return recs.head(10)[
        ["Series_Title", "Genre", "Director", "IMDB_Rating", "No_of_Votes","Poster_Link"]
    ].to_dict(orient="records")

@app.get("/recommend/show")
def recommend(show: str):
    show = show.strip().lower()

    if show not in dfshow["Title"].values:
        raise HTTPException(status_code=404, detail="Show not found")

    # Target show
    target = dfshow[dfshow["Title"] == show].iloc[0]

    target_genres = set(target["Genre_List"])
    target_cast = set(target["Cast_List"])
    target_rating = target["Rating"]

    recommendations = dfshow[dfshow["Title"] != show].copy()

    # ---------------- SCORING ----------------

    # Genre similarity (Jaccard)
    recommendations["genre_score"] = recommendations["Genre_List"].apply(
        lambda x: len(set(x) & target_genres) / len(set(x) | target_genres)
    )

    # Cast overlap
    recommendations["cast_score"] = recommendations["Cast_List"].apply(
        lambda x: len(set(x) & target_cast)
    )

    # Rating similarity (closer = better)
    recommendations["rating_score"] = 1 - abs(recommendations["Rating"] - target_rating) / 10

    # Normalize cast score
    if recommendations["cast_score"].max() != 0:
        recommendations["cast_score"] /= recommendations["cast_score"].max()

    # Weighted final score
    recommendations["final_score"] = (
        0.5 * recommendations["genre_score"] +
        0.3 * recommendations["rating_score"] +
        0.2 * recommendations["cast_score"]
    )

    # Filter bad matches
    recommendations = recommendations[
        (recommendations["genre_score"] > 0) &
        (recommendations["Rating"] >= target_rating - 1.5)
    ]

    # Sort and pick top results
    recommendations = recommendations.sort_values(
        by=["final_score", "Number of Votes"],
        ascending=False
    ).head(10)

    return recommendations[["Title", "Genre", "Rating", "Release Year"]].to_dict(orient="records")

@app.get("/recommend/director")
def recommend_director(director: str):
    director = director.strip().lower()
    
    # Find movies by this director
    director_movies = df[df["Director"].str.lower() == director]
    
    if director_movies.empty:
        return {"error": "Director not found"}
    
    # Get all movies by this director, sorted by rating
    director_movies = director_movies.sort_values("score", ascending=False)
    
    # If we have less than 10 movies, add movies with similar genres
    if len(director_movies) < 10:
        # Get genres from this director's movies
        all_genres = set()
        for _, movie in director_movies.iterrows():
            all_genres.update(clean_genres(movie["Genre"]))
        
        # Find movies with similar genres from other directors
        similar_movies = df[
            (df["Director"].str.lower() != director) &
            (df["Genre"].apply(lambda g: len(all_genres & clean_genres(g)) > 0))
        ]
        similar_movies = similar_movies.sort_values("score", ascending=False)
        
        # Combine and remove duplicates
        recommendations = pd.concat([director_movies, similar_movies]).drop_duplicates("Series_Title")
    else:
        recommendations = director_movies
    
    return recommendations.head(10)[
        ["Series_Title", "Genre", "Director", "IMDB_Rating", "No_of_Votes","Poster_Link"]
    ].to_dict(orient="records")

@app.get("/recommend/actor")
def recommend_actor(actor: str):
    actor = actor.strip().lower()

    if not actor:
        return []

    actor_movies = df[
        (df["Star1"] == actor) |
        (df["Star2"] == actor) |
        (df["Star3"] == actor) |
        (df["Star4"] == actor)
    ]

    if actor_movies.empty:
        return []

    recommendations = actor_movies.sort_values("score", ascending=False)

    return recommendations.head(10)[
        ["Series_Title", "Genre", "Director", "IMDB_Rating", "No_of_Votes", "Poster_Link"]
    ].to_dict(orient="records")


@app.get("/recommend/genre")
def recommend_genre(genre: str):
    genre = genre.strip().lower()
    
    # Find movies with this genre
    genre_movies = df[df["Genre"].str.lower().str.contains(genre, na=False)]
    
    if genre_movies.empty:
        return {"error": "Genre not found"}
    
    # Sort by rating
    genre_movies = genre_movies.sort_values("score", ascending=False)
    
    return genre_movies.head(10)[
        ["Series_Title", "Genre", "Director", "IMDB_Rating", "No_of_Votes","Poster_Link"]
    ].to_dict(orient="records")

