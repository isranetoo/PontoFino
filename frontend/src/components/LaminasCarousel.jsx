import React, { useState, useEffect } from "react";

// Substitua os exemplos por ações (stocks) do Brasil e do mundo
const laminas = [
  {
    nome: "PETROBRAS (PETR4.SA)",
    pais: "Brasil",
    setor: "Petróleo e Gás",
    preco: "R$ 38,20",
    variacao: "+2,15%",
    marketcap: "R$ 497 bi",
  },
  {
    nome: "VALE (VALE3.SA)",
    pais: "Brasil",
    setor: "Mineração",
    preco: "R$ 67,50",
    variacao: "-0,85%",
    marketcap: "R$ 343 bi",
  },
  {
    nome: "APPLE (AAPL)",
    pais: "EUA",
    setor: "Tecnologia",
    preco: "US$ 195,10",
    variacao: "+1,12%",
    marketcap: "US$ 3,01 tri",
  },
  {
    nome: "TESLA (TSLA)",
    pais: "EUA",
    setor: "Automotivo",
    preco: "US$ 182,63",
    variacao: "-3,21%",
    marketcap: "US$ 580 bi",
  },
  {
    nome: "AMBEV (ABEV3.SA)",
    pais: "Brasil",
    setor: "Bebidas",
    preco: "R$ 13,45",
    variacao: "+0,42%",
    marketcap: "R$ 211 bi",
  },
  {
    nome: "NESTLÉ (NESN.SW)",
    pais: "Suíça",
    setor: "Alimentos",
    preco: "CHF 97,34",
    variacao: "+0,25%",
    marketcap: "CHF 267 bi",
  },
  {
    nome: "MICROSOFT (MSFT)",
    pais: "EUA",
    setor: "Tecnologia",
    preco: "US$ 410,32",
    variacao: "+0,98%",
    marketcap: "US$ 3,08 tri",
  },
  {
    nome: "ITAÚ UNIBANCO (ITUB4.SA)",
    pais: "Brasil",
    setor: "Financeiro",
    preco: "R$ 30,12",
    variacao: "+1,05%",
    marketcap: "R$ 294 bi",
  },
  {
    nome: "ALIBABA (BABA)",
    pais: "China",
    setor: "E-commerce",
    preco: "US$ 72,15",
    variacao: "-1,12%",
    marketcap: "US$ 185 bi",
  },
  {
    nome: "SANTANDER BRASIL (SANB11.SA)",
    pais: "Brasil",
    setor: "Financeiro",
    preco: "R$ 29,80",
    variacao: "+0,33%",
    marketcap: "R$ 112 bi",
  },
  {
    nome: "GOOGLE (GOOGL)",
    pais: "EUA",
    setor: "Tecnologia",
    preco: "US$ 175,22",
    variacao: "+1,45%",
    marketcap: "US$ 2,18 tri",
  },
  {
    nome: "BRADESCO (BBDC4.SA)",
    pais: "Brasil",
    setor: "Financeiro",
    preco: "R$ 15,90",
    variacao: "-0,21%",
    marketcap: "R$ 170 bi",
  },
  {
    nome: "AMAZON (AMZN)",
    pais: "EUA",
    setor: "E-commerce",
    preco: "US$ 185,99",
    variacao: "+2,05%",
    marketcap: "US$ 1,94 tri",
  },
  {
    nome: "JBS (JBSS3.SA)",
    pais: "Brasil",
    setor: "Alimentos",
    preco: "R$ 27,40",
    variacao: "+0,75%",
    marketcap: "R$ 62 bi",
  },
  {
    nome: "SAMSUNG (005930.KS)",
    pais: "Coreia do Sul",
    setor: "Tecnologia",
    preco: "₩ 77.800",
    variacao: "+0,60%",
    marketcap: "₩ 464 tri",
  },
];

const getVisibleCount = () => {
  return 10;
};

const LaminasCarousel = () => {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount());
  const [direction, setDirection] = useState("left"); // "left" | "right"

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection("left");
      setIndex((i) => (i + visibleCount) % laminas.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [visibleCount]);

  const prev = () => {
    setDirection("right");
    setIndex((i) => (i - visibleCount + laminas.length) % laminas.length);
  };
  const next = () => {
    setDirection("left");
    setIndex((i) => (i + visibleCount) % laminas.length);
  };

  const getVisibleLaminas = () => {
    return Array.from({ length: visibleCount }).map(
      (_, idx) => laminas[(index + idx) % laminas.length]
    );
  };

  return (
    <div className="w-full flex flex-col items-center my-10">
      <div className="flex items-center justify-between w-full shadow p-2 relative overflow-hidden">
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-100 hover:bg-blue-200 rounded-full p-1 z-10"
          aria-label="Anterior"
        >
          &#8592;
        </button>
        <div
          className={`flex flex-1 justify-center gap-3 transition-transform duration-500 ease-in-out`}
          style={{
            transform:
              direction === "left"
                ? "translateX(0)"
                : direction === "right"
                ? "translateX(0)"
                : "translateX(0)",
            // O movimento real é feito pelo keyframes abaixo
            animation:
              direction === "left"
                ? "carousel-left 0.5s"
                : direction === "right"
                ? "carousel-right 0.5s"
                : "none",
          }}
          onAnimationEnd={() => setDirection("")}
        >
          {getVisibleLaminas().map((stock, idx) => (
            <div
              key={stock.nome}
              className="flex flex-col items-center bg-blue-200 rounded-lg shadow p-2 max-w-[150px] min-w-[150px] min-h-[120px] max-h-[120px] transition-all overflow-hidden"
            >
              <span className="text-xs text-blue-700 mb-0.5">Ação em destaque</span>
              <h3 className="text-base font-bold text-blue-900 mb-0.5 text-center truncate w-full">{stock.nome}</h3>
              <span className="text-[10px] text-gray-500 mb-0.5 truncate w-full">{stock.pais} • {stock.setor}</span>
              <div className="flex flex-col items-center mb-0.5">
                <span className="text-base font-bold text-blue-800">{stock.preco}</span>
                <span className={`font-semibold text-xs ${stock.variacao.startsWith('+') ? "text-green-700" : "text-red-600"}`}>
                  {stock.variacao}
                </span>
              </div>
              <div className="text-[10px] text-gray-600 text-center truncate w-full">
                Market Cap: <span className="font-semibold">{stock.marketcap}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 hover:bg-blue-200 rounded-full p-1 z-10"
          aria-label="Próximo"
        >
          &#8594;
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        {laminas.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-blue-700" : "bg-blue-200"}`}
          />
        ))}
      </div>
      <style>
        {`
        @keyframes carousel-left {
          0% { transform: translateX(100px); opacity: 0.7;}
          100% { transform: translateX(0); opacity: 1;}
        }
        @keyframes carousel-right {
          0% { transform: translateX(-100px); opacity: 0.7;}
          100% { transform: translateX(0); opacity: 1;}
        }
        `}
      </style>
    </div>
  );
};

export default LaminasCarousel;
