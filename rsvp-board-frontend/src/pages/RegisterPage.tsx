import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (e: any) {
      setError(e.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Register as Host
        </h2>

        {error && (
          <div className="mb-4 text-red-400 text-center text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={submit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg 
            transition font-medium"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
