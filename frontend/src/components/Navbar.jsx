import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white p-4 rounded-[15px] shadow-md flex flex-col md:flex-row md:justify-between md:items-center mb-6 border border-gray-300 gap-4 md:gap-0 relative">
      <div className="flex items-center space-x-3 justify-center md:justify-start w-full md:w-auto">
        <img src="/assets/PontoFino_Logo.png" alt="Logo PontoFino" className="h-10 w-10" />
        <h1 className="text-2xl font-bold text-gray-800">PontoFino</h1>
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
      {/* Menu links - mobile: hidden by default, shown if menuOpen */}
      <div
        className={`flex-col md:flex md:flex-row md:static absolute top-20 left-0 w-full bg-white md:bg-transparent z-20 border-t md:border-0 transition-all duration-200 ${menuOpen ? 'flex' : 'hidden'} md:items-center md:justify-between`}
      >
        <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
          <li><a href="/" className="hover:underline text-gray-800">Home</a></li>
          <li><a href="/about" className="hover:underline text-gray-800">Sobre Nós</a></li>
        </ul>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-center mt-2 md:mt-0">
          <a
            href="/register"
            className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity w-full md:w-auto text-center text-base md:text-lg"
          >
            Registrar-se
          </a>
          <a
            href="/login"
            className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity w-full md:w-auto text-center text-base md:text-lg"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
