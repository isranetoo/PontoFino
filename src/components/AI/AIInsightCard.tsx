import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Lightbulb,
  ChevronRight,
  Zap
} from 'lucide-react';

interface AIInsightCardProps {
  type: 'spending' | 'budget' | 'investment' | 'fire' | 'general';
  title: string;
  description: string;
  data?: any;
  onAnalyze?: (response: any) => void;
  compact?: boolean;
}

export function AIInsightCard({
  type,
  title,
  description,
  data,
  onAnalyze,
  compact = false
}: AIInsightCardProps) {
  const {
    analyzeSpending,
    optimizeBudget,
    analyzeInvestments,
    planFIRE,
    askGeneral,
    loading
  } = useAI();

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getIcon = () => {
    switch (type) {
      case 'spending':
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      case 'budget':
        return <Target className="w-6 h-6 text-blue-500" />;
      case 'investment':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'fire':
        return <Zap className="w-6 h-6 text-purple-500" />;
      default:
        return <Lightbulb className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'spending':
        return 'from-red-100 to-red-50 border-red-300';
      case 'budget':
        return 'from-blue-100 to-blue-50 border-blue-300';
      case 'investment':
        return 'from-green-100 to-green-50 border-green-300';
      case 'fire':
        return 'from-purple-100 to-purple-50 border-purple-300';
      default:
        return 'from-yellow-100 to-yellow-50 border-yellow-300';
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      let response = null;

      switch (type) {
        case 'spending':
          response = await analyzeSpending(title);
          break;
        case 'budget':
          response = await optimizeBudget(title);
          break;
        case 'investment':
          response = await analyzeInvestments(data, title);
          break;
        case 'fire':
          response = await planFIRE(data, title);
          break;
        default:
          response = await askGeneral(title);
      }

      if (response) {
        setResult(response);
        onAnalyze?.(response);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (compact) {
    return (
      <div className={`p-4 bg-gradient-to-br ${getColor()} border rounded-lg shadow-md`}> {/* Modern shadow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"> {/* Subtle shadow */}
              {getIcon()}
            </div>
            <span className="text-base font-semibold text-gray-800">{title}</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || loading}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {analyzing ? 'Analisando...' : 'Analisar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br ${getColor()} border rounded-lg shadow-lg`}> {/* Enhanced shadow */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md"> {/* Larger icon */}
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {result.analysis}
            </div>
          </div>

          {result.recommendations?.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">💡 Dicas Práticas:</p>
              {result.recommendations.map((rec: any) => (
                <div key={rec.id} className="flex items-start space-x-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">{rec.title}: {rec.description}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Upgrade para Pro: análises personalizadas dos seus dados!
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={analyzing || loading}
          className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {analyzing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Bot className="w-5 h-5" />
              <span>Analisar com IA</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}