-- Add benchmark data as special funds
INSERT INTO funds (ticker, name, category, admin_fee, benchmark, risk_level, description, is_active)
VALUES 
  ('IBOV', 'Índice Bovespa', 'Benchmark', 0.0000, 'Ibovespa', 4, 'Índice oficial do mercado de ações brasileiro, composto pelas principais ações negociadas na B3.', true),
  ('CDI', 'Certificado de Depósito Interbancário', 'Benchmark', 0.0000, 'CDI', 1, 'Taxa de juros de referência do mercado financeiro brasileiro.', true),
  ('IFIX', 'Índice de Fundos Imobiliários', 'Benchmark', 0.0000, 'IFIX', 3, 'Índice que mede o desempenho médio dos fundos imobiliários negociados na B3.', true),
  ('DOLAR', 'Dólar Comercial', 'Benchmark', 0.0000, 'USD/BRL', 3, 'Taxa de câmbio entre o Real Brasileiro e o Dólar Americano.', true);

-- Adicionar dados históricos para os benchmarks
DO $$
DECLARE
  ibov_id UUID;
  cdi_id UUID;
  ifix_id UUID;
  dolar_id UUID;
  current_date DATE := CURRENT_DATE;
  price_date DATE;
  ibov_value NUMERIC := 100000;
  cdi_value NUMERIC := 1.0;
  ifix_value NUMERIC := 3000;
  dolar_value NUMERIC := 5.0;
BEGIN
  -- Pega os IDs dos benchmarks inseridos
  SELECT id INTO ibov_id FROM funds WHERE ticker = 'IBOV';
  SELECT id INTO cdi_id FROM funds WHERE ticker = 'CDI';
  SELECT id INTO ifix_id FROM funds WHERE ticker = 'IFIX';
  SELECT id INTO dolar_id FROM funds WHERE ticker = 'DOLAR';
  
  -- Gera 365 dias de histórico para cada benchmark
  FOR i IN 0..364 LOOP
    price_date := current_date - (364 - i || ' days')::INTERVAL;
    
    -- Pula finais de semana
    IF EXTRACT(DOW FROM price_date) NOT IN (0, 6) THEN
      -- Gera variações para cada índice
      
      -- Ibovespa: mais volátil
      ibov_value := ibov_value * (1 + (0.0004 + (random() * 0.03 - 0.015)));
      
      -- CDI: crescimento estável
      cdi_value := cdi_value * (1 + (0.00045 + random() * 0.00005));
      
      -- IFIX: menos volátil que Ibovespa
      ifix_value := ifix_value * (1 + (0.0002 + (random() * 0.02 - 0.009)));
      
      -- Dólar: volatilidade média
      dolar_value := dolar_value * (1 + (random() * 0.02 - 0.01));
      
      -- Insere no banco de dados
      INSERT INTO fund_prices (fund_id, price_date, quota_value, net_worth)
      VALUES 
        (ibov_id, price_date, ROUND(ibov_value::numeric, 2), NULL),
        (cdi_id, price_date, ROUND(cdi_value::numeric, 6), NULL),
        (ifix_id, price_date, ROUND(ifix_value::numeric, 2), NULL),
        (dolar_id, price_date, ROUND(dolar_value::numeric, 4), NULL);
    END IF;
  END LOOP;
END$$;
