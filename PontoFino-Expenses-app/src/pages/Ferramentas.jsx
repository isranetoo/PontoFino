import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const tools = [
	{
		title: 'Gestão de Orçamento',
		route: '/orcamento',
		icon: (
			<svg
				className="w-8 h-8 md:w-12 md:h-12 text-blue-400 mb-3"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path d="M3 10h18M9 16h6M12 6v10" />
			</svg>
		),
		desc: 'Controle total do seu dinheiro! Defina limites, monitore receitas e despesas em tempo real, visualize gráficos dinâmicos e receba alertas inteligentes para nunca sair do seu planejamento.',
		highlights: [
			'Alertas automáticos de gastos',
			'Relatórios visuais e exportação',
			'Personalização de categorias',
		],
		action: (
			<Link to="/app" className="w-full flex justify-center mt-auto">
				<Button variant="secondary" className="w-full font-semibold">
					Acessar
				</Button>
			</Link>
		),
		available: true,
		delay: 0.1,
	},
	{
		title: 'Metas Financeiras',
		icon: (
			<svg
				className="w-8 h-8 md:w-12 md:h-12 text-green-400 mb-3 animate-pulse"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path d="M12 19V5m7 7H5" />
			</svg>
		),
		desc: 'Transforme sonhos em conquistas! Crie metas personalizadas, acompanhe o progresso com gráficos motivadores e receba dicas para acelerar seus resultados.',
		highlights: [
			'Acompanhamento visual do progresso',
			'Dicas personalizadas',
			'Notificações de conquistas',
		],
		action: (
			<Button variant="secondary" className="mt-auto" disabled>
				Em breve
			</Button>
		),
		available: false,
		delay: 0.2,
	},
	{
		title: 'Simulador de Investimentos',
		route: '/simulador-investimentos',
		icon: (
			<svg
				className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 mb-3 animate-spin-slow"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 6v6l4 2" />
			</svg>
		),
		desc: 'Descubra o poder dos seus investimentos! Simule cenários, compare rentabilidades e veja como seu dinheiro pode crescer ao longo do tempo.',
		highlights: [
			'Comparação de fundos e ativos',
			'Projeção de rendimentos',
			'Simulações personalizadas',
		],
		action: (
			<Link to="/simulador-investimentos" className="w-full flex justify-center mt-auto">
				<Button variant="secondary" className="w-full font-semibold">
					Acessar
				</Button>
			</Link>
		),
		available: true,
		delay: 0.3,
	},
];

const testimonials = [
	{
		name: 'Ana Souza',
		text: 'Com a Gestão de Orçamento, finalmente consegui organizar minhas finanças e realizar minha viagem dos sonhos!',
		avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
	},
	{
		name: 'Carlos Lima',
		text: 'O Simulador de Investimentos me ajudou a entender onde investir melhor meu dinheiro. Recomendo muito!',
		avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
	},
];

export default function Ferramentas() {
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
				<svg
					className="hidden sm:block absolute right-1/3 top-1/4 animate-float-slow opacity-10"
					width="80"
					height="80"
					fill="none"
					viewBox="0 0 100 100"
				>
					<circle cx="50" cy="50" r="50" fill="#fff" />
				</svg>
			</div>
			<HomeNavBar />
			<div className="container mx-auto px-3 sm:px-6 md:px-10 py-6 sm:py-10 md:py-16 min-h-[60vh] flex-1 w-full relative z-10">
				<h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center mb-2 sm:mb-6 md:mb-10 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>
					Ferramentas da Plataforma
				</h1>
				<p className="text-center text-base sm:text-lg md:text-xl text-blue-100 mb-4 sm:mb-8 md:mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
					Tudo o que você precisa para dominar sua vida financeira em um só lugar.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
					{tools.map((tool, idx) => (
						<div
							key={tool.title}
							className={`bg-background rounded-2xl p-4 sm:p-8 md:p-10 shadow-2xl flex flex-col items-center border border-white/10 relative overflow-hidden animate-slide-up transition-all duration-300 group ${tool.available ? 'hover:scale-105 hover:shadow-blue-400/30' : 'opacity-70 grayscale'
								}`}
							style={{ animationDelay: `${tool.delay}s`, animationFillMode: 'both' }}
						>
							{/* Decorative blob */}
							<svg
								className="absolute -top-8 -right-8 w-12 sm:w-20 md:w-24 h-12 sm:h-20 md:h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
								fill="#00b6fc"
								viewBox="0 0 100 100"
							>
								<circle cx="50" cy="50" r="50" />
							</svg>
							<span className="drop-shadow-lg">{tool.icon}</span>
							<h2 className="text-base sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors duration-200 text-center">
								{tool.title}
							</h2>
							<p className="text-gray-400 mb-2 sm:mb-4 text-center text-xs sm:text-base md:text-lg">
								{tool.desc}
							</p>
							<ul className="mb-2 sm:mb-4 text-xs sm:text-sm md:text-base text-blue-200 list-disc list-inside text-left w-full max-w-xs mx-auto">
								{tool.highlights && tool.highlights.map((h, i) => (
									<li key={i} className="mb-1">
										{h}
									</li>
								))}
							</ul>
							{tool.action}
							{!tool.available && (
								<span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 sm:px-3 py-1 rounded-full animate-pulse shadow">
									Em breve
								</span>
							)}
						</div>
					))}
				</div>
				{/* Why use section */}
				<div className="mt-8 sm:mt-12 md:mt-16 text-center animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
					<h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 animate-slide-up" style={{ color: 'white' }}>
						Por que usar nossas ferramentas?
					</h3>
					<div className="flex flex-col md:flex-row justify-center gap-4 sm:gap-6 md:gap-10 mt-2 sm:mt-4">
						<div className="bg-white/10 rounded-xl p-4 sm:p-6 md:p-8 flex-1 min-w-[140px] sm:min-w-[180px] md:min-w-[220px] shadow-lg mb-2 md:mb-0">
							<h4 className="font-semibold text-blue-200 mb-1 sm:mb-2 md:mb-3">
								Segurança e Privacidade
							</h4>
							<p className="text-blue-100 text-xs sm:text-sm md:text-base">
								Seus dados protegidos com tecnologia de ponta.
							</p>
						</div>
						<div className="bg-white/10 rounded-xl p-4 sm:p-6 md:p-8 flex-1 min-w-[140px] sm:min-w-[180px] md:min-w-[220px] shadow-lg mb-2 md:mb-0">
							<h4 className="font-semibold text-blue-200 mb-1 sm:mb-2 md:mb-3">
								Tudo em um só lugar
							</h4>
							<p className="text-blue-100 text-xs sm:text-sm md:text-base">
								Centralize orçamento, metas e investimentos sem complicação.
							</p>
						</div>
						<div className="bg-white/10 rounded-xl p-4 sm:p-6 md:p-8 flex-1 min-w-[140px] sm:min-w-[180px] md:min-w-[220px] shadow-lg">
							<h4 className="font-semibold text-blue-200 mb-1 sm:mb-2 md:mb-3">
								Experiência Intuitiva
							</h4>
							<p className="text-blue-100 text-xs sm:text-sm md:text-base">
								Interface moderna, fácil de usar e acessível em qualquer dispositivo.
							</p>
						</div>
					</div>
				</div>
				{/* Testimonials */}
				<div className="mt-8 sm:mt-14 md:mt-20 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
					<h3 className="text-base sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6 text-white">
						O que nossos usuários dizem
					</h3>
					<div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 justify-center items-center">
						{testimonials.map((t, i) => (
							<div key={i} className="bg-white/10 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg flex flex-col items-center max-w-xs w-full">
								<img
									src={t.avatar}
									alt={t.name}
									className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-full mb-2 sm:mb-3 border-2 border-blue-300 shadow"
								/>
								<p className="text-blue-100 italic mb-1 sm:mb-2 text-xs sm:text-base md:text-lg">"{t.text}"</p>
								<span className="text-blue-200 font-semibold text-xs sm:text-base md:text-lg">{t.name}</span>
							</div>
						))}
					</div>
				</div>
				{/* Call to action */}
				<div className="mt-8 sm:mt-14 md:mt-20 text-center animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
					<h3 className="text-base sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 animate-slide-up" style={{ color: 'white' }}>
						Tem sugestões ou quer ver uma nova funcionalidade?
					</h3>
					<p className="text-gray-200 animate-fade-in mb-2 sm:mb-4 text-xs sm:text-base md:text-lg">
						Sua opinião é muito importante para nós! <br /> Envie seu feedback e ajude a construir a melhor plataforma financeira para você.
					</p>
					<a href="mailto:contato@pontofino.com" className="inline-block mt-2">
						<Button variant="outline" className="font-semibold text-base sm:text-lg md:text-xl">
							Enviar Feedback
						</Button>
					</a>
				</div>
				<div className="mt-6 sm:mt-10 md:mt-16 text-center animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
					<h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 animate-slide-up" style={{ color: 'white' }}>
						Mais ferramentas em breve!
					</h3>
					<p className="text-gray-200 animate-fade-in text-xs sm:text-base md:text-lg">
						Estamos trabalhando para trazer novas funcionalidades como integração bancária, relatórios personalizados, exportação de dados e muito mais.
					</p>
				</div>
			</div>
			<Footer />
		</div>
	);
}
