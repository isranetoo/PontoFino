import { FireResult, formatCurrency } from '../../utils/fireCalculations'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface FirePlannerResultsProps {
  result: FireResult
}

export function FirePlannerResults({ result }: FirePlannerResultsProps) {
  const currentYear = new Date().getFullYear()
  const fireYear = currentYear + Math.floor(result.horizonMonths / 12)
  
  // Calculate monthly withdrawal amount at FIRE
  const monthlyWithdrawal = result.targetWealthReal / 12 * 0.04 // Assuming 4% SWR
  return (
    <div className="space-y-10">
      {/* Resultado Principal */}
      <div className={`text-center p-10 rounded-3xl shadow-xl border-2 ${result.isAchievable ? 'bg-gradient-to-br from-green-50 to-blue-100 border-green-300' : 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300'}`}> 
        {result.isAchievable ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 drop-shadow-lg" />
            <h3 className="text-3xl font-extrabold text-green-900 mb-2 tracking-tight">Independência Financeira Alcançada!</h3>
            <div className="text-5xl font-black text-green-700 mb-2">{fireYear}</div>
            <p className="text-green-800 text-lg">Você atingirá a independência financeira em <span className="font-bold">{fireYear}</span>.</p>
          </>
        ) : (
          <>
            <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4 drop-shadow-lg" />
            <h3 className="text-3xl font-extrabold text-yellow-900 mb-2 tracking-tight">Meta não atingível</h3>
            <p className="text-yellow-800 text-lg">Com os parâmetros atuais, a meta não é atingível em 100 anos.<br/>Considere aumentar a contribuição ou ajustar as expectativas.</p>
          </>
        )}
      </div>

      {/* Métricas-Chave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-7 h-7 text-blue-600" />
            <span className="font-semibold text-gray-900">Meta de Patrimônio</span>
          </div>
          <div className="text-md font-bold text-blue-600">{formatCurrency(result.targetWealthReal)}</div>
          <p className="text-sm text-gray-500">Em poder de compra atual</p>
        </div>
        <div className="bg-white border border-green-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-7 h-7 text-green-600" />
            <span className="font-semibold text-gray-900">Retirada Mensal Segura</span>
          </div>
          <div className="text-md font-bold text-green-600">{formatCurrency(monthlyWithdrawal)}</div>
          <p className="text-sm text-gray-500">Com base em 4% a.a.</p>
        </div>
        <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-7 h-7 text-purple-600" />
            <span className="font-semibold text-gray-900">Prazo</span>
          </div>
          <div className="text-md font-bold text-purple-600">{Math.floor(result.horizonMonths / 12)} anos</div>
          <p className="text-sm text-gray-500">{result.horizonMonths} meses total</p>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-7 h-7 text-orange-600" />
            <span className="font-semibold text-gray-900">Valor Nominal</span>
          </div>
          <div className="text-md font-bold text-orange-600">{formatCurrency(result.targetWealthNominal)}</div>
          <p className="text-sm text-gray-500">Valor projetado em {fireYear}</p>
        </div>
      </div>

      {/* Resumo da Estratégia */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow">
        <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>📋 Resumo da Estratégia</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
          <div>
            <span className="font-medium text-gray-700">Taxa de Retirada:</span> 4,0% ao ano
          </div>
          <div>
            <span className="font-medium text-gray-700">Múltiplo de Gastos:</span> 25x gastos anuais
          </div>
          <div>
            <span className="font-medium text-gray-700">Margem de Segurança:</span> Conservadora
          </div>
          <div>
            <span className="font-medium text-gray-700">Retorno Real:</span> {(result.monthlyRealReturn * 12 * 100).toFixed(2)}% ao ano
          </div>
        </div>
      </div>

      {/* Próximos Passos */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-green-100 shadow">
        <h4 className="font-semibold text-green-900 mb-3 text-lg flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>🎯 Próximos Passos</h4>
        <ul className="text-base text-green-800 space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-1" /> Revise suas despesas e aumente a taxa de poupança se possível.</li>
          <li className="flex items-start gap-2"><TrendingUp className="w-5 h-5 text-blue-500 mt-1" /> Busque retornos reais consistentes e diversifique sua carteira.</li>
          <li className="flex items-start gap-2"><Calendar className="w-5 h-5 text-purple-500 mt-1" /> Reavalie o plano anualmente e ajuste premissas conforme necessário.</li>
          <li className="flex items-start gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" /> Considere cenários adversos e mantenha uma reserva de emergência.</li>
        </ul>
      </div>
    </div>
  )
}