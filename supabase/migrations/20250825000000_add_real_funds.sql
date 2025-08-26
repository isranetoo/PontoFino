-- Add real funds to the funds table
-- This migration adds several real investment funds with realistic data

-- ETFs brasileiros
INSERT INTO funds (ticker, name, category, admin_fee, benchmark, risk_level, description, is_active)
VALUES 
  ('BOVA11', 'iShares Ibovespa Fundo de Índice', 'ETF Ações Brasil', 0.0031, 'Ibovespa', 4, 'ETF que busca retornos de investimentos que correspondam, de forma geral, à performance, antes de taxas e despesas, do Índice Bovespa.', true),
  ('IVVB11', 'iShares S&P 500 FII', 'ETF Ações Internacionais', 0.0023, 'S&P 500', 4, 'ETF que busca retornos de investimentos que correspondam, de forma geral, à performance do índice S&P 500, principal índice do mercado americano.', true),
  ('HASH11', 'Hashdex Nasdaq Crypto Index FII', 'ETF Criptomoedas', 0.0130, 'Nasdaq Crypto Index', 5, 'Primeiro ETF de criptomoedas do Brasil, que busca replicar o índice Nasdaq Crypto Index.', true),
  ('SMAL11', 'iShares Small Cap Fundo de Índice', 'ETF Ações Brasil', 0.0050, 'SMLL', 4, 'ETF que busca retornos de investimentos que correspondam à performance do Índice Small Cap (SMLL).', true),
  ('GOLD11', 'iShares Gold Fundo de Investimento', 'ETF Commodities', 0.0028, 'Ouro', 3, 'ETF que busca replicar a variação do preço do ouro.', true);

-- Fundos Imobiliários
INSERT INTO funds (ticker, name, category, admin_fee, benchmark, risk_level, description, is_active)
VALUES 
  ('HGLG11', 'CSHG Logística FII', 'FII Logística', 0.0066, 'IFIX', 3, 'Fundo de investimento imobiliário focado em ativos logísticos e industriais.', true),
  ('KNRI11', 'Kinea Renda Imobiliária FII', 'FII Lajes Corporativas', 0.0060, 'IFIX', 3, 'Fundo imobiliário com foco em lajes corporativas de alto padrão.', true),
  ('XPLG11', 'XP Log FII', 'FII Logística', 0.0070, 'IFIX', 3, 'Fundo imobiliário especializado em galpões logísticos de alto padrão.', true),
  ('HFOF11', 'Hedge FOF FII', 'FII Fundo de Fundos', 0.0100, 'IFIX', 3, 'Fundo de fundos imobiliários que investe em diversos FIIs do mercado.', true),
  ('VILG11', 'Vinci Logística FII', 'FII Logística', 0.0075, 'IFIX', 3, 'Fundo de investimento imobiliário de renda com gestão ativa especializado em imóveis logísticos.', true);

-- Fundos Multimercado
INSERT INTO funds (ticker, name, category, admin_fee, performance_fee, benchmark, risk_level, description, is_active)
VALUES 
  ('SAFRA11', 'Safra Galileo Multimercado FIC', 'Multimercado Macro', 0.0200, 0.2000, 'CDI', 4, 'Fundo multimercado que utiliza estratégias macro para buscar retornos acima do CDI.', true),
  ('VERDE11', 'Verde AM Scena FIC FIM', 'Multimercado Macro', 0.0200, 0.2000, 'CDI', 4, 'Fundo multimercado gerido pela Verde Asset Management, com estratégias diversificadas.', true),
  ('ADAM11', 'Adam Capital FIC FIM', 'Multimercado Macro', 0.0200, 0.2000, 'CDI', 4, 'Fundo multimercado com estratégia macro que busca retornos superiores ao CDI no médio/longo prazo.', true),
  ('SPX11', 'SPX Nimitz FIC FIM', 'Multimercado Macro', 0.0200, 0.2000, 'CDI', 4, 'Fundo multimercado gerido pela SPX Capital, com estratégias macro diversificadas.', true),
  ('GAVEAF11', 'Gávea Macro FIC FIM', 'Multimercado Macro', 0.0200, 0.2000, 'CDI', 4, 'Fundo multimercado com estratégia macro global, gerido pela Gávea Investimentos.', true);

-- Fundos de Renda Fixa
INSERT INTO funds (ticker, name, category, admin_fee, performance_fee, benchmark, risk_level, description, is_active)
VALUES 
  ('XP11', 'XP Referenciado DI FI', 'Renda Fixa Referenciado', 0.0050, NULL, 'CDI', 1, 'Fundo de renda fixa que busca acompanhar a variação do CDI com alta liquidez.', true),
  ('IMAB11', 'BB Renda Fixa Ref IMA-B FI', 'Renda Fixa Inflação', 0.0030, NULL, 'IMA-B', 2, 'Fundo que busca acompanhar a variação do IMA-B, índice composto por títulos públicos indexados à inflação (IPCA).', true),
  ('IRFM11', 'Itaú Renda Fixa IMA-B FI', 'Renda Fixa Inflação', 0.0035, NULL, 'IMA-B', 2, 'Fundo de renda fixa que busca retornos compatíveis com o índice IMA-B.', true),
  ('JURO11', 'Western Asset Renda Fixa Ativo FI', 'Renda Fixa Ativo', 0.0060, 0.2000, 'CDI', 2, 'Fundo de renda fixa que busca superar o CDI através de gestão ativa.', true),
  ('INFL11', 'Santander Renda Fixa Inflação FI', 'Renda Fixa Inflação', 0.0040, NULL, 'IMA-B', 2, 'Fundo de renda fixa que busca acompanhar ou superar o IMA-B.', true);

-- Agora, vamos inserir dados históricos de preços para permitir comparações
-- Usaremos os últimos 12 meses com dados realistas

-- Função auxiliar para gerar histórico de preços
DO $$
DECLARE
  fund_rec RECORD;
  current_date DATE := CURRENT_DATE;
  price_date DATE;
  initial_price NUMERIC;
  current_price NUMERIC;
  daily_change NUMERIC;
  net_worth NUMERIC;
BEGIN
  FOR fund_rec IN SELECT id, ticker FROM funds LOOP
    -- Define preço inicial baseado no tipo de fundo
    CASE 
      WHEN fund_rec.ticker LIKE '%11' THEN 
        initial_price := 85 + random() * 40; -- ETFs/FIIs entre 85-125
      WHEN fund_rec.ticker LIKE 'XP%' OR fund_rec.ticker LIKE 'IMAB%' OR fund_rec.ticker LIKE 'IRFM%' OR fund_rec.ticker LIKE 'JURO%' OR fund_rec.ticker LIKE 'INFL%' THEN
        initial_price := 1.0; -- Fundos RF começam em 1.0
      ELSE
        initial_price := 1.0 + random() * 2; -- Outros fundos
    END CASE;
    
    -- Define patrimônio líquido baseado no tipo
    CASE 
      WHEN fund_rec.ticker LIKE '%11' THEN 
        net_worth := 500000000 + random() * 1500000000; -- ETFs/FIIs têm PLs maiores
      ELSE
        net_worth := 100000000 + random() * 900000000;  -- Outros fundos
    END CASE;
    
    current_price := initial_price;
    
    -- Gera 365 dias de histórico
    FOR i IN 0..364 LOOP
      price_date := current_date - (364 - i || ' days')::INTERVAL;
      
      -- Pula finais de semana
      IF EXTRACT(DOW FROM price_date) NOT IN (0, 6) THEN
        -- Calcula variação diária (-1% a +1%), com tendência conforme o ticker
        CASE 
          WHEN fund_rec.ticker LIKE 'BOVA%' OR fund_rec.ticker LIKE 'SMAL%' THEN
            daily_change := 0.0005 + (random() * 0.02 - 0.01); -- Ações BR volatilidade maior
          WHEN fund_rec.ticker LIKE 'IVVB%' THEN
            daily_change := 0.0008 + (random() * 0.018 - 0.008); -- Ações EUA tendência positiva
          WHEN fund_rec.ticker LIKE 'HASH%' THEN
            daily_change := 0.0010 + (random() * 0.04 - 0.018); -- Cripto alta volatilidade
          WHEN fund_rec.ticker LIKE '%11' THEN
            daily_change := 0.0003 + (random() * 0.015 - 0.007); -- FIIs
          WHEN fund_rec.ticker IN ('XP11', 'IMAB11', 'IRFM11', 'JURO11', 'INFL11') THEN
            daily_change := 0.0002 + (random() * 0.004 - 0.001); -- RF tendência positiva baixa volatilidade
          ELSE
            daily_change := 0.0004 + (random() * 0.012 - 0.005); -- Multimercados
        END CASE;
        
        -- Atualiza preço com variação
        current_price := current_price * (1 + daily_change);
        
        -- Atualiza patrimônio líquido (assumindo fluxos aleatórios)
        net_worth := net_worth * (1 + daily_change) * (1 + (random() * 0.003 - 0.001));
        
        -- Insere no banco de dados
        INSERT INTO fund_prices (fund_id, price_date, quota_value, net_worth)
        VALUES (fund_rec.id, price_date, ROUND(current_price::numeric, 6), ROUND(net_worth::numeric, 2));
      END IF;
    END LOOP;
  END LOOP;
END$$;
