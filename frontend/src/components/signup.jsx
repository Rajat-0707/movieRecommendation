import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./signup.css"
import { API_BASE } from "../apiBase";

function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()


  const handleSignup = async () => {

    // ADDED CONDITIONS
    if (name.trim().length < 2) {
      alert("Name must be at least 2 characters long")
      return
    }

    if (email.trim().length < 5) {
      alert("Email must be at least 5 characters long")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }
    // ✅ END OF CHANGES

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Signup failed" }))
        alert(data.message || "Signup failed")
        return
      }

      alert("Account created")
      navigate("/login")
    } catch (e) {
      console.error(e)
      alert("Server error during signup")
    }
  }

  return (
    <>
      <div className="parent-container">
        <div className="container">

          <input
            type="text"
            placeholder="Enter your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSignup} disabled={!email || !password || !name}>
            Sign Up
          </button>

        </div>
      </div>
    </>
  )
}

export default Signup
