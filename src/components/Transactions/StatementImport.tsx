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
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Importar Extrato</h2>
      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          Clique para selecionar um arquivo ou arraste aqui
        </label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={onSuccess}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Importar
        </button>
      </div>
    </div>
  );
}