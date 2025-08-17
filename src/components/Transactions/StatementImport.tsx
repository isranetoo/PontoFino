import React, { useState } from 'react';

interface StatementImportProps {
  accounts: any[];
  categories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function StatementImport({ onSuccess, onCancel }: StatementImportProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', '.csv', '.ofx'];
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();

    if (!validTypes.includes(selectedFile.type) && !['csv', 'ofx'].includes(fileExtension || '')) {
      setError('Formato de arquivo não suportado. Use CSV ou OFX.');
      return;
    }

    setError(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 max-w-lg mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Importar Extrato</h2>
      <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-700 font-semibold text-lg hover:underline"
        >
          Clique para selecionar um arquivo <span className="font-normal text-gray-500">ou arraste aqui</span>
        </label>
        <p className="text-xs text-gray-500 mt-2">Formatos aceitos: <span className="font-medium text-blue-700">CSV</span> ou <span className="font-medium text-blue-700">OFX</span></p>
      </div>
      {error && <p className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-xl font-medium shadow-sm">{error}</p>}
      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 font-semibold transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={onSuccess}
          className="px-5 py-2.5 bg-blue-700 text-white rounded-xl shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 font-semibold transition-all"
        >
          Importar
        </button>
      </div>
    </div>
  );
}