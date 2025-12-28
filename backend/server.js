require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");

const connectDB = require("./config/db");
const auth = require("./middleware/auth");
const loginRoute = require("./routes/login");
const signupRoute = require("./routes/signup");
const logoutRoute = require("./routes/logout");
const User = require("./models/user");

const app = express();

const normalizeBaseUrl = (url) => (url || "").replace(/\/+$/, "");
const RECOMMENDER_BASE_URL = normalizeBaseUrl(
  process.env.RECOMMENDER_BASE_URL || "https://movierecommendation-7k9y.onrender.com"
);
const extraCorsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:")) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      if (extraCorsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

connectDB();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/login", loginRoute);
app.use("/signup", signupRoute);
app.use("/logout", logoutRoute);

app.use("/api/signup", signupRoute);

app.get("/search/movie", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/search/movie`, {
      params: { q },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json([]);
  }
});

app.get("/search/show", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/search/show`, {
      params: { q },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json([]);
  }
});

app.get("/search/director", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/search/director`, {
      params: { q },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json([]);
  }
});

app.get("/search/genre", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/search/genre`, {
      params: { q },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json([]);
  }
});

app.get("/recommend/movie/:movie", async (req, res) => {
  try {
    const movie = req.params.movie;

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/recommend/movie`, {
      params: { movie },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Recommendation service unavailable" });
  }
});

app.get("/recommend/show/:show", async (req, res) => {
  try {
    const response = await axios.get(`${RECOMMENDER_BASE_URL}/recommend/show`, {
      params: { show: req.params.show },
    });

    res.json({ recommendations: response.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ recommendations: [] });
  }
});

app.get("/recommend/director/:director", async (req, res) => {
  try {
    const director = req.params.director;

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/recommend/director`, {
      params: { director },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Recommendation service unavailable" });
  }
});

app.get("/recommend/actor/:actor", async (req, res) => {
  try {
    const actor = req.params.actor;

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/recommend/actor`, {
      params: { actor },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Recommendation service unavailable" });
  }
});

app.get("/recommend/genre/:genre", async (req, res) => {
  try {
    const genre = req.params.genre;

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/recommend/genre`, {
      params: { genre },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Recommendation service unavailable" });
  }
});

app.get("/search/actor", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);

    const response = await axios.get(`${RECOMMENDER_BASE_URL}/search/actor`, {
      params: { q },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json([]);
  }
});

app.post("/favourite", auth, async (req, res) => {
  try {
    const { item, action } = req.body;

    if (!item) {
      return res.status(400).json({ error: "Item missing" });
    }

    const userId = req.user.id; // ✅ FIXED
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.favourites = user.favourites || [];

    const getKey = (m) =>
      m.Series_Title || m.Title || m.name;

    const itemKey = getKey(item);

    if (action === "remove") {
      user.favourites = user.favourites.filter(
        (m) => getKey(m) !== itemKey
      );
    } else {
      const exists = user.favourites.some(
        (m) => getKey(m) === itemKey
      );
      if (!exists) user.favourites.push(item);
    }

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("FAVOURITE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/favourite", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user?.favourites || []);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});


app.delete("/favourite", auth, async (req, res) => {
  try {
    const { item } = req.body;

    const user = await User.findById(req.user.id);

    const getKey = (m) => m?.Series_Title || m?.Title || m?.name;
    const itemKey = getKey(item);

    user.favourites = (user.favourites || []).filter(
      (m) => getKey(m) !== itemKey
    );

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Remove failed" });
  }
});


app.post("/watched", auth, async (req, res) => {
  try {
    const { item, action } = req.body;

    const user = await User.findById(req.user.id);

    const getKey = (m) => m?.Series_Title || m?.Title || m?.name;
    const itemKey = getKey(item);

    if (action === "remove") {
      user.watched = (user.watched || []).filter(
        (m) => getKey(m) !== itemKey
      );
    } else {
      user.watched = user.watched || [];
      const exists = user.watched.some(
        (m) => getKey(m) === itemKey
      );
      if (!exists) user.watched.push(item);
    }

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Watched update failed" });
  }
});


app.get("/watched", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user?.watched || []);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});


app.delete("/watched", auth, async (req, res) => {
  try {
    const { item } = req.body;

    const user = await User.findById(req.user.id);

    const getKey = (m) => m?.Series_Title || m?.Title || m?.name;
    const itemKey = getKey(item);

    user.watched = (user.watched || []).filter(
      (m) => getKey(m) !== itemKey
    );

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Remove failed" });
  }
});



// app.get("/api/recommend/movie/:movie", async (req, res) => {
//   try {
//     const movie = req.params.movie;

//     const response = await axios.get(
//       "http://127.0.0.1:8000/recommend",
//       { params: { movie } }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Recommendation service unavailable" });
//   }
// });
app.get("/", auth, (req, res) => {
  res.json({
    loggedIn: true,
    user: req.user
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
