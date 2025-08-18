import React, { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, Check, X } from 'lucide-react'

interface StatementImportProps {
  accounts: any[]
  categories: any[]
  onSuccess: () => void
  onCancel: () => void
}

interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
}

export function StatementImport({ accounts, categories, onSuccess, onCancel }: StatementImportProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [selectedAccount, setSelectedAccount] = useState('')
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload')

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', '.csv', '.ofx']
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop()
    
    if (!validTypes.includes(selectedFile.type) && !['csv', 'ofx'].includes(fileExtension || '')) {
      setError('Formato de arquivo não suportado. Use CSV ou OFX.')
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const parseCSV = (csvText: string): ParsedTransaction[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const transactions: ParsedTransaction[] = []

    // Assumir formato: Data,Descrição,Valor
    // Pular cabeçalho se existir
    const startIndex = lines[0].toLowerCase().includes('data') ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const columns = line.split(',').map(col => col.replace(/"/g, '').trim())
      
      if (columns.length >= 3) {
        const dateStr = columns[0]
        const description = columns[1]
        const amountStr = columns[2].replace(/[^\d.,-]/g, '').replace(',', '.')
        const amount = parseFloat(amountStr)

        if (!isNaN(amount) && description) {
          // Tentar parsear data em diferentes formatos
          let date = ''
          try {
            const parsedDate = new Date(dateStr)
            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate.toISOString().split('T')[0]
            } else {
              // Tentar formato brasileiro DD/MM/YYYY
              const [day, month, year] = dateStr.split('/')
              if (day && month && year) {
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString().split('T')[0]
              }
            }
          } catch {
            date = new Date().toISOString().split('T')[0] // Fallback para hoje
          }

          transactions.push({
            date,
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense'
          })
        }
      }
    }

    return transactions
  }

  const processFile = async () => {
    if (!file || !selectedAccount) return

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      let parsed: ParsedTransaction[] = []

      if (file.name.toLowerCase().endsWith('.csv')) {
        parsed = parseCSV(text)
      } else if (file.name.toLowerCase().endsWith('.ofx')) {
        // Implementação básica para OFX - em produção seria mais robusta
        setError('Importação OFX ainda não implementada. Use CSV por enquanto.')
        return
      }

      if (parsed.length === 0) {
        setError('Nenhuma transação válida encontrada no arquivo.')
        return
      }

      setParsedTransactions(parsed)
      setStep('review')

    } catch (err) {
      setError('Erro ao processar arquivo. Verifique o formato.')
    } finally {
      setLoading(false)
    }
  }

  const importTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      // Em uma implementação real, isso seria uma chamada para API
      // Por enquanto, simular sucesso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('success')
      setTimeout(() => {
        onSuccess()
      }, 2000)

    } catch (err) {
      setError('Erro ao importar transações.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Importação concluída!
        </h3>
        <p className="text-gray-600">
          {parsedTransactions.length} transação(ões) foram importadas com sucesso.
        </p>
      </div>
    )
  }

  if (step === 'review') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Revisar Transações
          </h3>
          <p className="text-gray-600">
            {parsedTransactions.length} transação(ões) encontrada(s). Revise antes de importar.
          </p>
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parsedTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{transaction.date}</td>
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    R$ {transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('upload')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Voltar
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={importTransactions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Importando...' : 'Importar Transações'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Importar Extrato
        </h3>
        <p className="text-gray-600">
          Faça upload de um arquivo CSV ou OFX para importar suas transações automaticamente.
        </p>
      </div>

      {/* Seleção de conta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conta de destino *
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Selecione uma conta</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {/* Área de upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Arraste seu arquivo aqui
            </p>
            <p className="text-gray-600">
              ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formatos suportados: CSV, OFX
            </p>
          </div>
        )}

        <input
          type="file"
          accept=".csv,.ofx"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        
        {!file && (
          <label
            htmlFor="file-upload"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Selecionar Arquivo
          </label>
        )}
      </div>

      {/* Formato esperado */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Formato CSV esperado:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Primeira linha (opcional): Data,Descrição,Valor</p>
          <p>• Data: DD/MM/YYYY ou YYYY-MM-DD</p>
          <p>• Descrição: texto da transação</p>
          <p>• Valor: número positivo (receita) ou negativo (despesa)</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>

        <button
          onClick={processFile}
          disabled={!file || !selectedAccount || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processando...' : 'Processar Arquivo'}
        </button>
      </div>
    </div>
  )
}