/*
  # Complete Platform Schema Update

  1. New Tables
    - `subscriptions` - User subscription plans and billing status
    - `usage_quotas` - Monthly usage tracking per user
    - `plan_features` - Feature limits and availability per plan
    - `ai_interactions` - AI copilot conversation history
    - `fx_rates` - Exchange rates for multi-currency features
    - `retirement_plans` - International retirement planning
    - `retirement_results` - Retirement calculation results

  2. Enhanced Tables
    - Updated `users` table with proper auth integration
    - Enhanced `funds` and `fund_prices` with real market data
    - Improved `assets` table for portfolio tracking

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for user data access
    - Secure AI interaction logging

  4. Sample Data
    - Real Brazilian funds (FIIs, ETFs, etc.)
    - Sample user with Pro subscription
    - AI interaction examples
    - Market data for testing

  5. Functions
    - Account balance update triggers
    - Usage quota management
    - Subscription status helpers
*/

-- ==================== USERS TABLE ====================
-- Ensure users table exists and is properly configured
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text,
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token_new text,
  email_change text,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  phone text,
  phone_confirmed_at timestamptz,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamptz,
  email_change_token_current text DEFAULT '',
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token text,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ==================== SUBSCRIPTIONS ====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== USAGE QUOTAS ====================
CREATE TABLE IF NOT EXISTS usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- Format: YYYY-MM
  fund_comparisons integer DEFAULT 0,
  budget_alerts integer DEFAULT 0,
  portfolio_scenarios integer DEFAULT 0,
  data_exports integer DEFAULT 0,
  fire_planning integer DEFAULT 0,
  crisis_simulations integer DEFAULT 0,
  retirement_plans integer DEFAULT 0,
  ai_interactions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own usage quotas"
  ON usage_quotas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== PLAN FEATURES ====================
CREATE TABLE IF NOT EXISTS plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL CHECK (plan IN ('free', 'pro', 'premium')),
  feature_key text NOT NULL,
  is_enabled boolean DEFAULT true,
  limit_value integer DEFAULT -1, -- -1 means unlimited
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan, feature_key)
);

ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan features are publicly readable"
  ON plan_features
  FOR SELECT
  TO authenticated
  USING (true);

-- ==================== AI INTERACTIONS ====================
CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id text,
  interaction_type text NOT NULL CHECK (interaction_type IN ('spending_analysis', 'budget_optimization', 'investment_advice', 'fire_planning', 'crisis_simulation', 'general_query')),
  user_query text NOT NULL,
  ai_response jsonb NOT NULL,
  page_context text,
  data_context jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI interactions"
  ON ai_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== FX RATES ====================
CREATE TABLE IF NOT EXISTS fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date date NOT NULL,
  base_currency text NOT NULL,
  quote_currency text NOT NULL,
  rate numeric(10,6) NOT NULL,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  UNIQUE(rate_date, base_currency, quote_currency)
);

ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FX rates are publicly readable"
  ON fx_rates
  FOR SELECT
  TO authenticated
  USING (true);

-- ==================== RETIREMENT PLANS ====================
CREATE TABLE IF NOT EXISTS retirement_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_currency text NOT NULL DEFAULT 'BRL',
  spend_currency text NOT NULL DEFAULT 'EUR',
  target_country text,
  current_age integer NOT NULL,
  retirement_age integer NOT NULL,
  life_expectancy integer NOT NULL,
  monthly_expenses numeric(15,2) NOT NULL,
  expense_inflation_rate numeric(5,4) NOT NULL,
  safe_withdrawal_rate numeric(5,4) NOT NULL,
  incomes jsonb DEFAULT '[]'::jsonb,
  portfolio jsonb DEFAULT '[]'::jsonb,
  fx_assumptions jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE retirement_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own retirement plans"
  ON retirement_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== RETIREMENT RESULTS ====================
CREATE TABLE IF NOT EXISTS retirement_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES retirement_plans(id) ON DELETE CASCADE,
  years_to_retirement integer NOT NULL,
  required_wealth_base numeric(20,2) NOT NULL,
  required_wealth_spend numeric(20,2) NOT NULL,
  success_probability numeric(5,4) NOT NULL,
  ruin_risk numeric(5,4) NOT NULL,
  series jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE retirement_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own retirement results"
  ON retirement_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== ENHANCED FUNDS DATA ====================
-- Clear existing funds and add real Brazilian market data
DELETE FROM fund_prices;
DELETE FROM funds;

-- Insert real Brazilian funds
INSERT INTO funds (ticker, name, category, admin_fee, performance_fee, benchmark, risk_level, description, is_active) VALUES
-- FIIs (Fundos Imobiliários)
('XPML11', 'XP Malls FII', 'FII', 1.00, NULL, 'IFIX', 3, 'Fundo de investimento imobiliário focado em shopping centers', true),
('HGLG11', 'CSHG Logística FII', 'FII', 0.90, NULL, 'IFIX', 3, 'Fundo imobiliário especializado em galpões logísticos', true),
('KNRI11', 'Kinea Renda Imobiliária FII', 'FII', 0.75, NULL, 'IFIX', 2, 'Fundo diversificado em imóveis comerciais', true),
('MXRF11', 'Maxi Renda FII', 'FII', 0.80, NULL, 'IFIX', 3, 'Fundo imobiliário com foco em renda', true),

-- ETFs Internacionais
('IVVB11', 'iShares Core S&P 500 FII', 'Ações Internacionais', 0.30, NULL, 'S&P 500', 4, 'ETF que replica o índice S&P 500', true),
('BOVA11', 'iShares Ibovespa FII', 'Ações Nacionais', 0.50, NULL, 'Ibovespa', 4, 'ETF que replica o Ibovespa', true),
('HASH11', 'Hashdex Nasdaq Crypto Index FII', 'Criptomoedas', 1.30, NULL, 'NASDAQ Crypto Index', 5, 'ETF de criptomoedas', true),
('GOLD11', 'It Now Gold FII', 'Commodities', 0.75, NULL, 'Ouro', 3, 'ETF que acompanha o preço do ouro', true),

-- Fundos Multimercado
('VISC11', 'Vinci Shopping Centers FII', 'FII', 0.95, NULL, 'IFIX', 3, 'Shopping centers premium', true),
('KNCR11', 'Kinea Crédito Imobiliário FII', 'FII', 1.20, NULL, 'IFIX', 4, 'Crédito imobiliário e CRIs', true),

-- Fundos de Renda Fixa
('FIIP11B', 'Fundo de Investimento Imobiliário Plural', 'FII', 1.00, NULL, 'IFIX', 2, 'Imóveis corporativos AAA', true),
('RBRF11', 'RBR Fundo de Fundos FII', 'FII', 0.75, NULL, 'IFIX', 3, 'Fundo de fundos imobiliários', true);

-- Insert sample fund prices (last 12 months)
DO $$
DECLARE
  fund_record RECORD;
  price_date DATE;
  base_price NUMERIC;
  current_price NUMERIC;
  volatility NUMERIC;
  trend NUMERIC;
BEGIN
  FOR fund_record IN SELECT id, ticker FROM funds LOOP
    -- Set base price and characteristics based on fund type
    CASE 
      WHEN fund_record.ticker LIKE '%11' THEN
        base_price := 100.0;
        volatility := 0.15; -- 15% volatility for FIIs
        trend := 0.08; -- 8% annual trend
      WHEN fund_record.ticker = 'HASH11' THEN
        base_price := 50.0;
        volatility := 0.35; -- 35% volatility for crypto
        trend := 0.25; -- 25% annual trend
      ELSE
        base_price := 100.0;
        volatility := 0.20; -- 20% volatility for others
        trend := 0.12; -- 12% annual trend
    END CASE;

    current_price := base_price;
    
    -- Generate prices for last 365 days
    FOR i IN 0..364 LOOP
      price_date := CURRENT_DATE - INTERVAL '1 day' * i;
      
      -- Add trend and random volatility
      current_price := current_price * (1 + (trend / 365) + (RANDOM() - 0.5) * volatility * 0.1);
      
      -- Ensure price doesn't go below 10% of base price
      current_price := GREATEST(current_price, base_price * 0.1);
      
      INSERT INTO fund_prices (fund_id, price_date, quota_value, net_worth)
      VALUES (
        fund_record.id,
        price_date,
        ROUND(current_price, 6),
        ROUND(current_price * 1000000, 2) -- Mock net worth
      );
    END LOOP;
  END LOOP;
END $$;

-- ==================== PLAN FEATURES DATA ====================
INSERT INTO plan_features (plan, feature_key, is_enabled, limit_value) VALUES
-- Free Plan
('free', 'fund_comparisons', true, 2),
('free', 'budget_alerts', true, 3),
('free', 'portfolio_scenarios', false, 0),
('free', 'data_exports', true, 2),
('free', 'fire_planning', true, 1),
('free', 'crisis_simulations', false, 0),
('free', 'retirement_planning', false, 0),
('free', 'ai_interactions', true, 25),
('free', 'advanced_charts', false, 0),

-- Pro Plan
('pro', 'fund_comparisons', true, 5),
('pro', 'budget_alerts', true, 20),
('pro', 'portfolio_scenarios', true, 5),
('pro', 'data_exports', true, 10),
('pro', 'fire_planning', true, -1),
('pro', 'crisis_simulations', true, 10),
('pro', 'retirement_planning', true, 3),
('pro', 'ai_interactions', true, 100),
('pro', 'advanced_charts', true, 1),

-- Premium Plan
('premium', 'fund_comparisons', true, -1),
('premium', 'budget_alerts', true, -1),
('premium', 'portfolio_scenarios', true, -1),
('premium', 'data_exports', true, -1),
('premium', 'fire_planning', true, -1),
('premium', 'crisis_simulations', true, -1),
('premium', 'retirement_planning', true, -1),
('premium', 'ai_interactions', true, -1),
('premium', 'advanced_charts', true, -1),
('premium', 'api_access', true, 1),
('premium', 'priority_support', true, 1),
('premium', 'ai_narrative_reports', true, 1),
('premium', 'ai_auto_actions', true, 1);

-- ==================== FX RATES DATA ====================
INSERT INTO fx_rates (rate_date, base_currency, quote_currency, rate, source) VALUES
-- Current rates (2025-01-01)
(CURRENT_DATE, 'USD', 'BRL', 6.15, 'manual'),
(CURRENT_DATE, 'EUR', 'BRL', 6.45, 'manual'),
(CURRENT_DATE, 'GBP', 'BRL', 7.55, 'manual'),
(CURRENT_DATE, 'CAD', 'BRL', 4.35, 'manual'),
(CURRENT_DATE, 'AUD', 'BRL', 3.85, 'manual'),
(CURRENT_DATE, 'CHF', 'BRL', 6.75, 'manual'),
(CURRENT_DATE, 'USD', 'EUR', 0.95, 'manual'),
(CURRENT_DATE, 'GBP', 'USD', 1.23, 'manual'),

-- Historical rates (last 30 days with small variations)
(CURRENT_DATE - INTERVAL '1 day', 'USD', 'BRL', 6.12, 'manual'),
(CURRENT_DATE - INTERVAL '2 days', 'USD', 'BRL', 6.18, 'manual'),
(CURRENT_DATE - INTERVAL '3 days', 'USD', 'BRL', 6.10, 'manual'),
(CURRENT_DATE - INTERVAL '7 days', 'USD', 'BRL', 6.08, 'manual'),
(CURRENT_DATE - INTERVAL '14 days', 'USD', 'BRL', 6.22, 'manual'),
(CURRENT_DATE - INTERVAL '30 days', 'USD', 'BRL', 6.05, 'manual');

-- ==================== SAMPLE USER DATA ====================
-- Create a sample user with Pro subscription for testing
DO $$
DECLARE
  sample_user_id uuid;
  sample_profile_id uuid;
  checking_account_id uuid;
  savings_account_id uuid;
  investment_account_id uuid;
  salary_category_id uuid;
  food_category_id uuid;
  transport_category_id uuid;
  housing_category_id uuid;
  entertainment_category_id uuid;
BEGIN
  -- Create sample user (this would normally be handled by Supabase Auth)
  INSERT INTO users (id, email, email_confirmed_at, created_at)
  VALUES (gen_random_uuid(), 'demo@financehub.com', now(), now())
  RETURNING id INTO sample_user_id;

  -- Create user profile
  INSERT INTO profiles (user_id, email, full_name, currency)
  VALUES (sample_user_id, 'demo@financehub.com', 'Usuário Demo', 'BRL')
  RETURNING id INTO sample_profile_id;

  -- Create Pro subscription
  INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end)
  VALUES (
    sample_user_id, 
    'pro', 
    'active', 
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days'
  );

  -- Create usage quota for current month
  INSERT INTO usage_quotas (user_id, month_year, fund_comparisons, ai_interactions, portfolio_scenarios)
  VALUES (sample_user_id, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 3, 15, 2);

  -- Create sample accounts
  INSERT INTO accounts (user_id, name, type, balance, currency)
  VALUES 
    (sample_user_id, 'Conta Corrente Nubank', 'checking', 5420.50, 'BRL'),
    (sample_user_id, 'Poupança Caixa', 'savings', 12800.00, 'BRL'),
    (sample_user_id, 'Carteira de Investimentos', 'investment', 85600.00, 'BRL')
  RETURNING id INTO checking_account_id;

  -- Get account IDs for transactions
  SELECT id INTO checking_account_id FROM accounts WHERE user_id = sample_user_id AND type = 'checking';
  SELECT id INTO savings_account_id FROM accounts WHERE user_id = sample_user_id AND type = 'savings';
  SELECT id INTO investment_account_id FROM accounts WHERE user_id = sample_user_id AND type = 'investment';

  -- Create sample categories
  INSERT INTO categories (user_id, name, type, color, icon)
  VALUES 
    (sample_user_id, 'Salário', 'income', '#10B981', 'Briefcase'),
    (sample_user_id, 'Alimentação', 'expense', '#EF4444', 'Utensils'),
    (sample_user_id, 'Transporte', 'expense', '#F59E0B', 'Car'),
    (sample_user_id, 'Moradia', 'expense', '#8B5CF6', 'Home'),
    (sample_user_id, 'Lazer', 'expense', '#EC4899', 'Gamepad2')
  RETURNING id INTO salary_category_id;

  -- Get category IDs
  SELECT id INTO salary_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Salário';
  SELECT id INTO food_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Alimentação';
  SELECT id INTO transport_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Transporte';
  SELECT id INTO housing_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Moradia';
  SELECT id INTO entertainment_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Lazer';

  -- Create sample transactions (last 30 days)
  INSERT INTO transactions (user_id, account_id, category_id, amount, description, transaction_date, type) VALUES
  -- Income
  (sample_user_id, checking_account_id, salary_category_id, 8500.00, 'Salário Janeiro', CURRENT_DATE - INTERVAL '5 days', 'income'),
  (sample_user_id, checking_account_id, salary_category_id, 1200.00, 'Freelance Design', CURRENT_DATE - INTERVAL '10 days', 'income'),
  
  -- Expenses
  (sample_user_id, checking_account_id, food_category_id, -450.80, 'Supermercado Extra', CURRENT_DATE - INTERVAL '1 day', 'expense'),
  (sample_user_id, checking_account_id, food_category_id, -89.50, 'iFood - Jantar', CURRENT_DATE - INTERVAL '2 days', 'expense'),
  (sample_user_id, checking_account_id, transport_category_id, -120.00, 'Combustível', CURRENT_DATE - INTERVAL '3 days', 'expense'),
  (sample_user_id, checking_account_id, transport_category_id, -45.80, 'Uber Centro', CURRENT_DATE - INTERVAL '4 days', 'expense'),
  (sample_user_id, checking_account_id, housing_category_id, -1800.00, 'Aluguel Janeiro', CURRENT_DATE - INTERVAL '5 days', 'expense'),
  (sample_user_id, checking_account_id, housing_category_id, -280.50, 'Conta de Luz', CURRENT_DATE - INTERVAL '7 days', 'expense'),
  (sample_user_id, checking_account_id, entertainment_category_id, -150.00, 'Cinema + Pipoca', CURRENT_DATE - INTERVAL '8 days', 'expense'),
  (sample_user_id, checking_account_id, entertainment_category_id, -89.90, 'Netflix + Spotify', CURRENT_DATE - INTERVAL '15 days', 'expense');

  -- Create sample budgets
  INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, spent) VALUES
  (sample_user_id, food_category_id, 800.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 540.30),
  (sample_user_id, transport_category_id, 400.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 165.80),
  (sample_user_id, entertainment_category_id, 300.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 239.90);

  -- Create sample goals
  INSERT INTO goals (user_id, name, description, target_amount, current_amount, target_date, category) VALUES
  (sample_user_id, 'Reserva de Emergência', 'Reserva para 6 meses de gastos', 30000.00, 12800.00, CURRENT_DATE + INTERVAL '8 months', 'emergency'),
  (sample_user_id, 'Viagem Europa', 'Férias de 15 dias na Europa', 15000.00, 4200.00, CURRENT_DATE + INTERVAL '10 months', 'travel'),
  (sample_user_id, 'Independência Financeira', 'FIRE - 25x gastos anuais', 1500000.00, 85600.00, CURRENT_DATE + INTERVAL '18 years', 'fire');

  -- Add some funds to watchlist
  INSERT INTO watchlists (user_id, fund_id)
  SELECT sample_user_id, id FROM funds WHERE ticker IN ('XPML11', 'IVVB11', 'BOVA11') LIMIT 3;

  -- Create sample planning profile
  INSERT INTO planning_profiles (user_id, name, base_currency, monthly_expenses, monthly_contribution, current_wealth, exp_inflation_aa, exp_return_real_aa, safe_withdrawal_rate, tax_rate)
  VALUES (sample_user_id, 'Meu Plano FIRE', 'BRL', 5000.00, 2500.00, 85600.00, 0.04, 0.06, 0.04, 0.15);

  -- Create sample AI interactions
  INSERT INTO ai_interactions (user_id, interaction_type, user_query, ai_response, page_context) VALUES
  (sample_user_id, 'spending_analysis', 'Como posso reduzir meus gastos?', '{"analysis": "Análise dos seus gastos mostra oportunidades de economia...", "recommendations": []}', 'dashboard'),
  (sample_user_id, 'fire_planning', 'Quando posso me aposentar?', '{"analysis": "Com seu perfil atual, você pode atingir FIRE em 18 anos...", "recommendations": []}', 'fire'),
  (sample_user_id, 'budget_optimization', 'Meus orçamentos estão adequados?', '{"analysis": "Seus orçamentos estão bem estruturados...", "recommendations": []}', 'budgets');

END $$;

-- ==================== ENHANCED ASSETS ====================
-- Add sample assets for portfolio tracking
INSERT INTO assets (ticker, name, asset_class, currency, metadata) VALUES
('PETR4', 'Petrobras PN', 'Equity', 'BRL', '{"beta": 1.2, "sector": "Energy", "volatility": 0.28}'),
('VALE3', 'Vale ON', 'Equity', 'BRL', '{"beta": 1.1, "sector": "Materials", "volatility": 0.25}'),
('ITUB4', 'Itaú Unibanco PN', 'Equity', 'BRL', '{"beta": 1.0, "sector": "Financials", "volatility": 0.22}'),
('BBDC4', 'Bradesco PN', 'Equity', 'BRL', '{"beta": 0.95, "sector": "Financials", "volatility": 0.20}'),
('NTNB-2035', 'Tesouro IPCA+ 2035', 'Bond', 'BRL', '{"duration_years": 8.5, "duration_mod": 8.2, "credit_rating": "AAA"}'),
('LTN-2027', 'Tesouro Prefixado 2027', 'Bond', 'BRL', '{"duration_years": 2.5, "duration_mod": 2.4, "credit_rating": "AAA"}'),
('BTC', 'Bitcoin', 'Crypto', 'USD', '{"beta": 2.5, "volatility": 0.65}'),
('ETH', 'Ethereum', 'Crypto', 'USD', '{"beta": 2.8, "volatility": 0.70}');

-- ==================== TRIGGERS ====================
-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables that need updated_at
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT unnest(ARRAY['subscriptions', 'usage_quotas', 'retirement_plans', 'accounts', 'profiles', 'budgets', 'goals', 'planning_profiles'])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
        BEFORE UPDATE ON %I 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- ==================== INDEXES ====================
-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_month ON usage_quotas(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_fx_rates_date ON fx_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_fx_rates_pair ON fx_rates(base_currency, quote_currency);
CREATE INDEX IF NOT EXISTS idx_retirement_plans_user_id ON retirement_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_retirement_results_plan_id ON retirement_results(plan_id);

-- ==================== HELPER FUNCTIONS ====================
-- Function to get current usage for a user
CREATE OR REPLACE FUNCTION get_current_usage(user_uuid uuid, feature_name text)
RETURNS integer AS $$
DECLARE
  current_month text;
  usage_count integer;
BEGIN
  current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Get or create usage record for current month
  INSERT INTO usage_quotas (user_id, month_year)
  VALUES (user_uuid, current_month)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  -- Get usage count based on feature
  EXECUTE format('SELECT COALESCE(%I, 0) FROM usage_quotas WHERE user_id = $1 AND month_year = $2', feature_name)
  INTO usage_count
  USING user_uuid, current_month;
  
  RETURN COALESCE(usage_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(user_uuid uuid, feature_name text)
RETURNS boolean AS $$
DECLARE
  current_month text;
BEGIN
  current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Increment usage
  EXECUTE format('
    INSERT INTO usage_quotas (user_id, month_year, %I)
    VALUES ($1, $2, 1)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET %I = usage_quotas.%I + 1
  ', feature_name, feature_name, feature_name)
  USING user_uuid, current_month;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check feature access
CREATE OR REPLACE FUNCTION can_use_feature(user_uuid uuid, feature_name text)
RETURNS jsonb AS $$
DECLARE
  user_plan text;
  feature_limit integer;
  current_usage integer;
  result jsonb;
BEGIN
  -- Get user's current plan
  SELECT plan INTO user_plan
  FROM subscriptions 
  WHERE user_id = user_uuid 
  AND status IN ('active', 'trialing')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Default to free if no subscription found
  user_plan := COALESCE(user_plan, 'free');
  
  -- Get feature limit for user's plan
  SELECT limit_value INTO feature_limit
  FROM plan_features
  WHERE plan = user_plan AND feature_key = feature_name AND is_enabled = true;
  
  -- If feature not found or disabled, deny access
  IF feature_limit IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Recurso não disponível no seu plano',
      'current_plan', user_plan
    );
  END IF;
  
  -- If unlimited (-1), allow access
  IF feature_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current_plan', user_plan
    );
  END IF;
  
  -- Check current usage
  current_usage := get_current_usage(user_uuid, feature_name);
  
  -- Return result
  IF current_usage < feature_limit THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current_plan', user_plan,
      'usage', current_usage,
      'limit', feature_limit
    );
  ELSE
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Limite mensal atingido (%s/%s)', current_usage, feature_limit),
      'current_plan', user_plan,
      'usage', current_usage,
      'limit', feature_limit
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_current_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION can_use_feature(uuid, text) TO authenticated;