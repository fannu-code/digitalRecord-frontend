import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!username || !password) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    if (!isLogin && !code) {
      setMessage("Please enter the registration code.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      let response;

      if (isLogin) {
        response = await axios.post("http://localhost:5000/api/auth/login", {
          username,
          password,
        });
      } else {
        response = await axios.post("http://localhost:5000/api/auth/signup", {
          username,
          password,
          code,
        });
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage(response.data.message);
      setMessageType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setMessage("");
    setMessageType("");
    setUsername("");
    setPassword("");
    setCode("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden grid md:grid-cols-2">
        {/* Left Official Information Panel */}
        <div className="hidden md:flex flex-col justify-between bg-slate-800 text-white p-12">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-xl bg-white text-slate-800 flex items-center justify-center text-2xl font-bold">
                DR
              </div>

              <div>
                <h1 className="text-xl font-bold">Dairy Record Management</h1>

                <p className="text-sm text-slate-300">
                  Digital Record & Document System
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-4xl font-bold leading-tight">
                Secure Digital
                <br />
                Record Management
              </h2>

              <p className="mt-6 text-slate-300 leading-7">
                A centralized system for securely submitting, managing,
                searching, and retrieving official dairy records and documents.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <p className="text-sm text-slate-400">
              © 2026 Dairy Record Management System
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Secure • Organized • Accessible
            </p>
          </div>
        </div>

        {/* Authentication Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Secure Access Portal
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h2>

            <p className="text-slate-500 mt-2">
              {isLogin
                ? "Enter your credentials to access the system."
                : "Complete the information below to register."}
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 mb-8">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`py-3 rounded-md font-semibold transition ${
                isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`py-3 rounded-md font-semibold transition ${
                !isLogin
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* Signup Code */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Registration Code
                </label>

                <input
                  type="text"
                  placeholder="Enter your predefined code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Enter the authorized registration code provided to you.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white py-3.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Login to System"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              Authorized access only. All activities may be monitored and
              recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
