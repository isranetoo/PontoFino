import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';

const projects = [
	{
		icon: (
			<svg
				className="w-10 h-10 text-blue-400"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path d="M3 10h18M9 16h6M12 6v10" />
			</svg>
		),
		title: 'Integração Bancária',
		text: 'Conecte suas contas bancárias e importe transações automaticamente, facilitando o controle financeiro sem esforço manual.',
		badge: 'Em breve',
	},
	{
		icon: (
			<svg
				className="w-10 h-10 text-green-400"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path d="M4 17h16M4 13h16M4 9h16" />
			</svg>
		),
		title: 'Relatórios Personalizados',
		text: 'Gere relatórios detalhados, gráficos interativos e exporte seus dados para Excel ou PDF, tornando a análise financeira simples e visual.',
		badge: 'Planejado',
	},
	{
		icon: (
			<svg
				className="w-10 h-10 text-yellow-400 animate-spin-slow"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 6v6l4 2" />
			</svg>
		),
		title: 'Educação Financeira',
		text: 'Acesse dicas personalizadas, conteúdos educativos e trilhas de aprendizado para evoluir sua saúde financeira.',
		badge: 'Em pesquisa',
	},
	{
		icon: (
			<svg
				className="w-10 h-10 text-pink-400 animate-float-slow"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<rect x="4" y="4" width="16" height="16" rx="4" />
			</svg>
		),
		title: 'App Mobile',
		text: 'Tenha o PontoFino na palma da mão! Aplicativo para Android e iOS, com notificações e sincronização em tempo real.',
		badge: 'Futuro',
	},
];

export default function ProjetoFuturo() {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] relative overflow-hidden">
			{/* Floating blobs */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
				<svg
					className="absolute left-2 top-2 sm:left-8 sm:top-8 md:left-16 md:top-16 animate-float-slow opacity-20"
					width="60"
					height="60"
					fill="none"
					viewBox="0 0 120 120"
				>
					<circle cx="60" cy="60" r="60" fill="#00b6fc" />
				</svg>
				<svg
					className="absolute right-2 bottom-2 sm:right-8 sm:bottom-8 md:right-16 md:bottom-16 animate-float-slow opacity-10"
					width="80"
					height="80"
					fill="none"
					viewBox="0 0 160 160"
				>
					<rect width="160" height="160" rx="40" fill="#fff" />
				</svg>
			</div>
			<HomeNavBar />
			<main className="container mx-auto px-3 sm:px-6 md:px-10 py-6 sm:py-10 md:py-16 flex-1 w-full relative z-10 flex flex-col items-center">
				<h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-center mb-2 sm:mb-6 md:mb-10 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>
					Projetos Futuros
				</h1>
				<h2 className="text-base sm:text-xl md:text-2xl text-blue-200 font-semibold text-center mb-3 sm:mb-6 md:mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
					O futuro das suas finanças começa aqui!
				</h2>
				<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-10 text-gray-200 text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl md:max-w-4xl mx-auto animate-fade-in w-full" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
					{projects.map((proj, idx) => (
						<li
							key={proj.title}
							className="flex flex-col items-center bg-background/70 rounded-2xl px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12 shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300 animate-slide-up relative w-full"
							style={{ animationDelay: `${0.4 + idx * 0.07}s`, animationFillMode: 'both' }}
						>
							<span className="mb-2 sm:mb-3 md:mb-4">{proj.icon}</span>
							<span className="font-bold text-base sm:text-xl md:text-2xl text-white mb-1 sm:mb-2 flex items-center gap-2">
								{proj.title}
								<span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{proj.badge}</span>
							</span>
							<span className="text-gray-200 text-center mb-1 sm:mb-2 md:mb-3">{proj.text}</span>
						</li>
					))}
				</ul>
				<div className="mt-8 sm:mt-12 md:mt-16 text-center animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
					<h3 className="text-base sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-white animate-slide-up">Tem uma ideia incrível?</h3>
					<p className="text-gray-200 text-xs sm:text-base md:text-lg mb-2 sm:mb-4">
						Sua sugestão pode ser o próximo grande recurso do PontoFino! Envie para{' '}
						<a href="mailto:contato@pontofino.com" className="underline text-blue-200 hover:text-blue-400">
							contato@pontofino.com
						</a>
					</p>
					<button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-full shadow-lg hover:scale-105 transition-transform text-sm sm:text-base md:text-lg">
						Enviar sugestão
					</button>
				</div>
				<div className="mt-6 sm:mt-10 md:mt-16 text-center animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
					<h4 className="text-base sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-white animate-slide-up">E muito mais por vir!</h4>
					<p className="text-gray-200 text-xs sm:text-base md:text-lg">Estamos sempre inovando para entregar a melhor experiência financeira para você. Fique ligado nas novidades!</p>
				</div>
			</main>
			<Footer />
		</div>
	);
}
