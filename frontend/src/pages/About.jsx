import React from "react";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 justify-center items-center px-2 sm:px-0">
      <div className="bg-white p-4 sm:p-8 sm:px-12 rounded-[15px] shadow-md max-w-3xl text-gray-800 w-full mt-8 mb-8 border border-gray-300">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-900">Sobre Nós</h2>
        <p className="text-lg mb-4 text-justify">
          A <span className="font-bold text-blue-900">PontoFino</span> nasceu do desejo de tornar o mundo dos investimentos mais acessível, transparente e eficiente para todos os brasileiros. Nossa plataforma foi criada por um grupo de entusiastas de tecnologia e finanças que acreditam que o conhecimento financeiro deve ser democrático e fácil de entender.
        </p>
        <p className="text-lg mb-4 text-justify">
          Desde o início, buscamos oferecer ferramentas intuitivas e recursos inovadores para ajudar nossos usuários a planejar, simular e alcançar seus objetivos financeiros. Com uma interface amigável e suporte dedicado, a PontoFino se tornou referência em educação e planejamento financeiro digital.
        </p>
        <p className="text-lg mb-4 text-justify">
          Nossa missão é ser o seu parceiro de confiança na jornada de investimentos, fornecendo informações claras, simulações precisas e acompanhamento contínuo para que você possa tomar as melhores decisões para o seu futuro.
        </p>
        <p className="text-lg text-justify">
          Junte-se a nós e faça parte dessa história de sucesso!
        </p>
      </div>
    </div>
  );
};

export default About;
