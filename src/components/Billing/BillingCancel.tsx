import React from 'react'
import { AlertCircle, ArrowLeft, MessageCircle, Star } from 'lucide-react'

export function BillingCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Processo Cancelado
          </h1>
          <p className="text-gray-600">
            Nenhuma cobrança foi realizada. Você pode tentar novamente a qualquer momento.
          </p>
        </div>

        {/* What Happened */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-yellow-900 mb-2">O que aconteceu?</h2>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• O processo de pagamento foi interrompido</li>
            <li>• Nenhuma cobrança foi realizada no seu cartão</li>
            <li>• Sua conta permanece no plano atual</li>
            <li>• Você pode tentar novamente quando quiser</li>
          </ul>
        </div>

        {/* Why Upgrade */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Por que nossos usuários escolhem o upgrade?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Análises Mais Profundas</h3>
                  <p className="text-sm text-gray-600">
                    Compare até 5 fundos com indicadores avançados como Sharpe e Drawdown
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Simulações de Crise</h3>
                  <p className="text-sm text-gray-600">
                    Teste sua carteira contra cenários como 2008 e COVID-19
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Planejamento Internacional</h3>
                  <p className="text-sm text-gray-600">
                    Planeje sua aposentadoria em Portugal, EUA ou outros países
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Suporte Especializado</h3>
                  <p className="text-sm text-gray-600">
                    Acesso direto a especialistas em planejamento financeiro
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <a
            href="/pricing"
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Ver Planos Novamente</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </a>
          
          <a
            href="/dashboard"
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Voltar ao Dashboard</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Teve algum problema ou precisa de ajuda?
          </p>
          <a
            href="mailto:suporte@PontoFino.com"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Fale com nosso suporte</span>
          </a>
        </div>
      </div>
    </div>
  )
}