import React from "react";

const dados = [
	{
		categoria: "Ações",
		fundos: [
			{
				nome: "WELLINGTON EUROPEAN EQUITY ADVISORY CLASSE INVESTIMENTO AÇÕES IE RL",
				retorno: "32,13%",
			},
			{ nome: "TREND XP INC FIC FI FINANCEIRO AÇÕES RL", retorno: "23,37%" },
			{ nome: "CSHG ALLOCATION SPX FALCON FIC FIF AÇÕES RL", retorno: "23,33%" },
			{ nome: "ITAÚ INDEX AÇÕES EUROPA EUR IE FIF CIC RL", retorno: "22,95%" },
			{ nome: "CSHG ALLOCATION SPX FALCON II FIC FIF AÇÕES RL", retorno: "22,80%" },
		],
	},
	{
		categoria: "Multimercado",
		fundos: [
			{ nome: "CHESS ALPHA FIC FIM RL", retorno: "55,79%" },
			{ nome: "PÁTRIA LONG BIASED FIC FIM", retorno: "35,91%" },
			{ nome: "VISTA MULTIESTRATÉGIA FIC FIM", retorno: "26,32%" },
			{ nome: "VISTA MULTIESTRATEGIA ADVISORY FIC FIM", retorno: "26,27%" },
			{ nome: "VISTA MULTIESTRATEGIA D60 FIC FIM", retorno: "25,13%" },
		],
	},
	{
		categoria: "Renda Fixa",
		fundos: [
			{
				nome: "JOURNEY CAPITAL VITREO RDVT11 INCENTIVADO INVESTIMENTO INFRAESTRUTURA RF",
				retorno: "35,15%",
			},
			{
				nome: "ITAÚ ACTION DEB INCENTIVADAS DIST FIF CIC FI INVESTIMENTO INFRA RF CP LP RL",
				retorno: "9,43%",
			},
			{
				nome: "ITAÚ ACTION DEB INCENTIVADAS FIF INCENTIVADO INFRA CIC RF CP LP RL",
				retorno: "9,42%",
			},
			{ nome: "LEGACY RF SELEÇÃO FIF CIC LP RL", retorno: "8,45%" },
			{ nome: "ANGÁ HIGH YIELD FI FINANCEIRO RF", retorno: "7,85%" },
		],
	},
];

const RankingFundos = () => (
	<div className="bg-white p-6 rounded shadow-md w-full my-10 border border-gray-200">
		<h2 className="text-2xl font-bold mb-2 text-blue-900 text-center">
			Ranking de Fundos
		</h2>
		<p className="text-center text-gray-700 mb-6">
			Confira abaixo os fundos com maior retorno dos últimos 6 meses
		</p>
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
			{dados.map((cat, idx) => (
				<div key={cat.categoria} className="flex flex-col">
					<h3 className="text-lg font-semibold text-blue-800 mb-3 text-center">
						{cat.categoria}
					</h3>
					<ol className="space-y-3">
						{cat.fundos.map((fundo, i) => (
							<li
								key={fundo.nome}
								className="flex flex-col bg-blue-50 rounded p-3 border border-blue-100"
							>
								<span className="font-bold text-blue-700">
									{i + 1}. {fundo.nome}
								</span>
								<span className="text-green-700 font-semibold text-lg">
									{fundo.retorno}
								</span>
							</li>
						))}
					</ol>
				</div>
			))}
		</div>
	</div>
);

export default RankingFundos;
