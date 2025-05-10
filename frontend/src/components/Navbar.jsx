function Navbar() {
  return (
    <nav className="bg-white p-4 rounded-[15px] shadow-md flex justify-between items-center mb-6 border border-gray-300">
      <h1 className="text-2xl font-bold text-gray-800">PontoFino</h1>
      <ul className="flex space-x-6">
        <li><a href="#home" className="hover:underline text-gray-800">Home</a></li>
        <li><a href="#about" className="hover:underline text-gray-800">Sobre Nós</a></li>
      </ul>      <div className="space-x-4">
        <button className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-4 py-2 rounded hover:opacity-90 transition-opacity">Registrar-se</button>
        <button className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white px-4 py-2 rounded hover:opacity-90 transition-opacity">Login</button>
      </div>
    </nav>
  );
}

export default Navbar;
