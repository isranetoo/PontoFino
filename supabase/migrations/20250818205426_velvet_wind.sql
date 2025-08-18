/*
  # Fix PostgreSQL ROUND function error

  1. Problem
    - ROUND(double precision, integer) does not exist in PostgreSQL
    - Need to cast to numeric before using ROUND with decimal places

  2. Solution
    - Cast base_price to numeric before ROUND
    - Cast calculation results to numeric before ROUND
*/

-- Fix the fund prices generation with proper casting
DO $$
DECLARE
  fund_record RECORD;
  price_date DATE;
  base_price DOUBLE PRECISION;
BEGIN
  -- Generate historical prices for all funds
  FOR fund_record IN SELECT id, ticker FROM funds WHERE is_active = true LOOP
    -- Generate prices for last 365 days
    FOR i IN 0..364 LOOP
      price_date := CURRENT_DATE - INTERVAL '1 day' * i;
      
      -- Generate realistic base price based on fund type
      base_price := CASE 
        WHEN fund_record.ticker LIKE '%11' THEN 80 + (random() * 120) -- FIIs: R$ 80-200
        WHEN fund_record.ticker LIKE 'BOVA%' THEN 100 + (random() * 50) -- ETFs: R$ 100-150
        WHEN fund_record.ticker LIKE 'HASH%' THEN 50 + (random() * 100) -- Crypto: R$ 50-150
        ELSE 10 + (random() * 90) -- Others: R$ 10-100
      END;
      
      -- Add some volatility based on days ago
      base_price := base_price * (1 + (random() - 0.5) * 0.1); -- ±5% daily volatility
      
      -- Insert with proper casting to numeric
      INSERT INTO fund_prices (fund_id, price_date, quota_value, net_worth)
      VALUES (
        fund_record.id,
        price_date,
        ROUND(base_price::numeric, 6),
        ROUND((base_price * (1000000 + random() * 9000000))::numeric, 2) -- Random net worth
      )
      ON CONFLICT (fund_id, price_date) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;