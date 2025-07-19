import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { WalletIcon, TargetIcon, TrendingUpIcon, CheckIcon, ShieldCheckIcon, LayersIcon, SparklesIcon, MailIcon, ClockIcon } from 'lucide-react';

const tools = [
	{
		title: 'Gestão de Orçamento',
		route: '/orcamento',
		icon: WalletIcon,
		color: 'bg-blue-500',
		desc: 'Controle total do seu dinheiro! Defina limites, monitore receitas e despesas em tempo real, visualize gráficos dinâmicos e receba alertas inteligentes para nunca sair do seu planejamento.',
		highlights: [
			'Alertas automáticos de gastos',
			'Relatórios visuais e exportação',
			'Personalização de categorias',
		],
		available: true,
		delay: 0.1,
	},
	{
		title: 'Metas Financeiras',
		route: '/orcamento/metas',
		icon: TargetIcon,
		color: 'bg-green-500',
		desc: 'Transforme sonhos em conquistas! Crie metas personalizadas, acompanhe o progresso com gráficos motivadores e receba dicas para acelerar seus resultados.',
		highlights: [
			'Acompanhamento visual do progresso',
			'Dicas personalizadas',
			'Notificações de conquistas',
		],
		available: false,
		delay: 0.2,
	},
	{
		title: 'Simulador de Investimentos',
		route: '/simulador-investimentos',
		icon: TrendingUpIcon,
		color: 'bg-yellow-500',
		desc: 'Descubra o poder dos seus investimentos! Simule cenários, compare rentabilidades e veja como seu dinheiro pode crescer ao longo do tempo.',
		highlights: [
			'Comparação de fundos e ativos',
			'Projeção de rendimentos',
			'Simulações personalizadas',
		],
		available: true,
		delay: 0.3,
	},
];

const benefits = [
	{
		icon: ShieldCheckIcon,
		title: 'Segurança e Privacidade',
		description: 'Seus dados protegidos com tecnologia de ponta e criptografia avançada.',
		color: 'bg-blue-500'
	},
	{
		icon: LayersIcon,
		title: 'Tudo em um só lugar',
		description: 'Centralize orçamento, metas e investimentos sem complicação.',
		color: 'bg-green-500'
	},
	{
		icon: SparklesIcon,
		title: 'Experiência Intuitiva',
		description: 'Interface moderna, fácil de usar e acessível em qualquer dispositivo.',
		color: 'bg-purple-500'
	},
];

const testimonials = [
	{
		name: 'Ana Souza',
		role: 'Empresária',
		text: 'Com a Gestão de Orçamento, finalmente consegui organizar minhas finanças e realizar minha viagem dos sonhos!',
		avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
		rating: 5
	},
	{
		name: 'Carlos Lima',
		role: 'Analista',
		text: 'O Simulador de Investimentos me ajudou a entender onde investir melhor meu dinheiro. Recomendo muito!',
		avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
		rating: 5
	},
];

export default function Ferramentas() {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
			<HomeNavBar />
			
			<div className="container mx-auto px-4 py-16 flex-1">
				{/* Header Section */}
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
						Ferramentas da <span className="text-blue-300">Plataforma</span>
					</h1>
					<p className="text-xl text-blue-100 max-w-3xl mx-auto">
						Tudo o que você precisa para dominar sua vida financeira em um só lugar.
					</p>
				</div>

				{/* Tools Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
					{tools.map((tool, index) => (
						<Card
							key={index}
							className={`group p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl transition-all duration-300 ${
								tool.available 
									? 'hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl' 
									: 'opacity-70'
							} relative overflow-hidden`}
						>
							{/* Status Badge */}
							{!tool.available && (
								<div className="absolute top-4 right-4">
									<span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
										<ClockIcon className="h-4 w-4" />
										Em breve
									</span>
								</div>
							)}

							<div className="flex flex-col items-center text-center h-full">
								{/* Icon */}
								<div className={`w-20 h-20 ${tool.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
									<tool.icon className="h-10 w-10 text-white" />
								</div>

								{/* Title */}
								<h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">
									{tool.title}
								</h3>

								{/* Description */}
								<p className="text-blue-100 leading-relaxed mb-6 flex-1">
									{tool.desc}
								</p>

								{/* Features List */}
								<div className="w-full mb-6">
									<ul className="space-y-2">
										{tool.highlights.map((highlight, idx) => (
											<li key={idx} className="flex items-center text-sm text-blue-200">
												<CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
												<span>{highlight}</span>
											</li>
										))}
									</ul>
								</div>

								{/* Action Button */}
								{tool.available ? (
									<Link to={tool.route} className="w-full">
										<Button className={`w-full ${
											tool.color === 'bg-blue-500' ? 'bg-blue-600 hover:bg-blue-500' :
											tool.color === 'bg-green-500' ? 'bg-green-600 hover:bg-green-500' :
											'bg-yellow-600 hover:bg-yellow-500'
										} text-white py-3 rounded-lg font-semibold transition-all duration-300`}>
											Acessar Ferramenta
										</Button>
									</Link>
								) : (
									<Button disabled className="w-full bg-gray-600 text-gray-300 py-3 rounded-lg font-semibold cursor-not-allowed">
										Em Desenvolvimento
									</Button>
								)}
							</div>
						</Card>
					))}
				</div>

				{/* Benefits Section */}
				<div className="mb-20">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-white mb-4">
							Por que usar nossas ferramentas?
						</h2>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{benefits.map((benefit, index) => (
							<Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-300">
								<div className="flex flex-col items-center text-center">
									<div className={`w-16 h-16 ${benefit.color} rounded-full flex items-center justify-center mb-4`}>
										<benefit.icon className="h-8 w-8 text-white" />
									</div>
									<h3 className="text-lg font-semibold text-white mb-3">
										{benefit.title}
									</h3>
									<p className="text-blue-100">
										{benefit.description}
									</p>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Testimonials Section */}
				<div className="mb-20">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-white mb-4">
							O que nossos usuários dizem
						</h2>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						{testimonials.map((testimonial, index) => (
							<Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
								<div className="flex flex-col items-center text-center">
									<img
										src={testimonial.avatar}
										alt={testimonial.name}
										className="w-16 h-16 rounded-full mb-4 border-2 border-blue-300"
									/>
									
									{/* Rating Stars */}
									<div className="flex items-center gap-1 mb-4">
										{[...Array(testimonial.rating)].map((_, i) => (
											<svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									
									<p className="text-blue-100 italic mb-4 leading-relaxed">
										"{testimonial.text}"
									</p>
									
									<div className="text-center">
										<h4 className="font-semibold text-white">{testimonial.name}</h4>
										<p className="text-blue-200 text-sm">{testimonial.role}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Feedback Section */}
				<div className="mb-20">
					<Card className="p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-2xl max-w-3xl mx-auto text-center">
						<MailIcon className="h-12 w-12 text-blue-300 mx-auto mb-4" />
						<h3 className="text-2xl font-bold text-white mb-4">
							Tem sugestões ou quer ver uma nova funcionalidade?
						</h3>
						<p className="text-blue-100 mb-6">
							Sua opinião é muito importante para nós! Envie seu feedback e ajude a construir 
							a melhor plataforma financeira para você.
						</p>
						<a href="mailto:contato@pontofino.com">
							<Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center">
								<MailIcon className="mr-2 h-5 w-5" />
								Enviar Feedback
							</Button>
						</a>
					</Card>
				</div>

				{/* Future Features */}
				<div className="text-center">
					<Card className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl max-w-2xl mx-auto">
						<ClockIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
						<h3 className="text-xl font-bold text-white mb-4">
							Mais ferramentas em breve!
						</h3>
						<p className="text-blue-100">
							Estamos trabalhando para trazer novas funcionalidades como integração bancária, 
							relatórios personalizados, exportação de dados e muito mais.
						</p>
					</Card>
				</div>
			</div>

			<Footer />
		</div>
	);
}
