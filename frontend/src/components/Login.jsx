import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    alert("Login realizado!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 justify-center items-center px-2 sm:px-0">
      <div className="bg-white p-4 sm:p-8 sm:px-12 rounded-[15px] shadow-md max-w-3xl text-gray-800 w-full mt-8 mb-8 border border-gray-300">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-900">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white py-3 rounded hover:opacity-90 transition-opacity font-semibold text-lg mt-4"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
