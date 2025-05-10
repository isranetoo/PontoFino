# PontoFino - Plataforma de Simulação de Investimentos

<img src="https://i.ibb.co/Kc7vZqV8/Ponto-Fino.png" alt="PontoFino Logo" width="300" />

## 📊 Sobre a Plataforma

PontoFino é uma aplicação web completa para simulação de investimentos com juros compostos, desenvolvida para ajudar pessoas a planejar seu futuro financeiro de forma inteligente. Nosso simulador permite que você visualize a evolução do seu patrimônio ao longo do tempo, com base em diferentes parâmetros de investimento.

## 🚀 Funcionalidades

- **Simulação de Investimento**: Calcule quanto tempo levará para atingir sua meta financeira
- **Visualização Detalhada**: Tabelas anuais e mensais com evolução do patrimônio
- **Parâmetros Personalizáveis**:
  - Valor inicial do investimento
  - Aporte mensal
  - Taxa de juros mensal
  - Meta financeira
  - Inflação anual (versão avançada)
  - Crescimento anual dos aportes (versão avançada)
  - Cálculo de Imposto de Renda (versão avançada)
- **Interface Moderna e Intuitiva**: Design responsivo com Tailwind CSS

## 🔧 Tecnologias Utilizadas

### Backend
- **Python**
- **FastAPI**: Framework web de alta performance
- **Pandas**: Para manipulação e análise de dados
- **Matplotlib**: Para geração de gráficos

### Frontend
- **React**: Biblioteca JavaScript para construção de interfaces
- **Tailwind CSS**: Framework CSS para design responsivo
- **Axios**: Cliente HTTP para requisições ao backend

## 💻 Como Executar o Projeto

### Pré-requisitos
- Python 3.8+
- Node.js 14+
- npm ou yarn

### Backend
```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
pip install fastapi uvicorn pandas matplotlib

# Execute o servidor
uvicorn main:app --reload
```

### Frontend
```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

## 📱 Acesso à Aplicação

Após iniciar os servidores, acesse:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

## 📈 Exemplo de Uso

1. Preencha o formulário com seus dados financeiros
2. Clique em "Simular"
3. Visualize o tempo necessário para atingir sua meta
4. Analise a tabela com a projeção anual do seu patrimônio

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você deseja contribuir, por favor:

1. Faça um fork do projeto
2. Crie uma nova branch (`git checkout -b feature/sua-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Envie para a branch (`git push origin feature/sua-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [Creative Commons Attribution ShareAlike 4.0](LICENSE).

## 📞 Contato

- Email: contato@pontofino.com.br
- Telefone: (11) 4002-8922

---

Desenvolvido com ❤️ pela equipe PontoFino