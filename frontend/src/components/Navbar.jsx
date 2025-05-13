import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white p-4 rounded-[15px] shadow-md mb-6 border border-gray-300 gap-4 relative">
      <div className="flex items-center justify-between w-full">
        {/* Logo à esquerda */}
        <div className="flex items-center space-x-3">
          <img src="/assets/PontoFino_Logo.png" alt="Logo PontoFino" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-gray-800">PontoFino</h1>
        </div>
        {/* Links centralizados no desktop */}
        <ul className="hidden md:flex flex-row space-x-6 items-center justify-center flex-1">
          <li><a href="/" className="hover:underline text-gray-800">Home</a></li>
          <li><a href="/about" className="hover:underline text-gray-800">Sobre Nós</a></li>
        </ul>
        {/* Botões à direita no desktop */}
        <div className="hidden md:flex flex-row space-x-4 items-center">
          <a
            href="/register"
            className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity text-center text-base md:text-lg"
          >
            Registrar-se
          </a>
          <a
            href="/login"
            className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity text-center text-base md:text-lg"
          >
            Login
          </a>
        </div>
        {/* Hamburger icon for mobile */}
        <button
          className="md:hidden ml-auto focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Menu mobile */}
      <div
        className={`md:hidden flex-col absolute top-20 left-0 w-full bg-white z-20 border-t transition-all duration-200 ${
          menuOpen ? 'flex items-center justify-center' : 'hidden'
        }`}
      >
        <ul className="flex flex-col space-y-2 items-center justify-center w-full">
          <li><a href="/" className="hover:underline text-gray-800">Home</a></li>
          <li><a href="/about" className="hover:underline text-gray-800">Sobre Nós</a></li>
        </ul>
        <div className="flex flex-col space-y-2 items-center justify-center w-full mt-2">
          <a
            href="/register"
            className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity w-full text-center text-base"
          >
            Registrar-se
          </a>
          <a
            href="/login"
            className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity w-full text-center text-base"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
