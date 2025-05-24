import { useState } from "react";

const Separador = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar lógica para enviar o nome e e-mail para sua API ou serviço de newsletter
    setEnviado(true);
    setNome("");
    setEmail("");
  };

  return (
    <div className="my-12 flex flex-col items-center w-full ">
      <div className="relative w-full flex justify-center mt-[25px] mb-[25px]">
        <hr className="w-full max-w-5xl border-t-4 border-blue-300 rounded" />
        <span className="absolute -top-5 bg-white px-6 py-1 rounded-full shadow text-blue-700 font-bold text-lg">
          Fique por dentro das melhores dicas de investimento!
        </span>
      </div>
      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 rounded-lg shadow-md p-6 w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 ">
        {/* Esquerda: texto */}
        <div className="flex-1 flex flex-col items-start">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            Assine nossa Newsletter
          </h3>
          <p className="text-gray-700 mb-4">
            Receba conteúdos exclusivos, dicas e novidades sobre investimentos diretamente no seu e-mail.
          </p>
        </div>
        {/* Direita: formulário */}
        <div className="flex-1 flex flex-col items-center w-full">
          {enviado ? (
            <div className="text-green-700 font-medium text-center">
              Obrigado por se inscrever! Em breve você receberá novidades.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl items-center">
              <input
                type="text"
                required
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="flex-1 p-3 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                required
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-3 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-opacity"
              >
                Assinar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Separador;
