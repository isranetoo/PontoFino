/*
  # Complete Platform Schema Update

  1. New Tables
    - `subscriptions` - User subscription plans and billing status
    - `usage_quotas` - Monthly usage tracking per user
    - `plan_features` - Feature limits and availability by plan
    - `ai_interactions` - AI conversation history and analytics
    - `fx_rates` - Exchange rates for multi-currency features
    - `retirement_plans` - International retirement planning data

  2. Sample Data
    - Real Brazilian funds (FIIs, ETFs) with historical prices
    - Demo user with Pro plan subscription
    - Sample transactions, budgets, and goals
    - AI interaction examples

  3. Security
    - RLS enabled on all new tables
    - User-specific access policies
    - Helper functions for usage tracking

  4. Functions
    - `get_current_usage()` - Check current monthly usage
    - `increment_usage()` - Increment usage counters
    - `can_use_feature()` - Check feature access
*/

-- ==================== SUBSCRIPTIONS ====================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_key ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ==================== USAGE QUOTAS ====================

CREATE TABLE IF NOT EXISTS usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own usage quotas"
  ON usage_quotas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS usage_quotas_user_month_key ON usage_quotas(user_id, month_year);

-- ==================== PLAN FEATURES ====================

CREATE TABLE IF NOT EXISTS plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL CHECK (plan IN ('free', 'pro', 'premium')),
  feature_key text NOT NULL,
  is_enabled boolean DEFAULT true,
  limit_value integer DEFAULT -1, -- -1 means unlimited
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan features are publicly readable"
  ON plan_features
  FOR SELECT
  TO authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS plan_features_plan_feature_key ON plan_features(plan, feature_key);

-- ==================== AI INTERACTIONS ====================

CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  interaction_type text NOT NULL CHECK (interaction_type IN ('spending_analysis', 'budget_optimization', 'investment_advice', 'fire_planning', 'crisis_simulation', 'general_query')),
  user_query text NOT NULL,
  ai_response jsonb NOT NULL,
  context_data jsonb,
  page_context text,
  tokens_used integer DEFAULT 0,
  response_time_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI interactions"
  ON ai_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session ON ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);

-- ==================== FX RATES ====================

CREATE TABLE IF NOT EXISTS fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date date NOT NULL,
  base_currency text NOT NULL,
  quote_currency text NOT NULL,
  rate numeric(10,6) NOT NULL,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FX rates are publicly readable"
  ON fx_rates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS fx_rates_date_pair_key ON fx_rates(rate_date, base_currency, quote_currency);

-- ==================== RETIREMENT PLANS ====================

CREATE TABLE IF NOT EXISTS retirement_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_currency text NOT NULL DEFAULT 'BRL',
  spend_currency text NOT NULL DEFAULT 'BRL',
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

CREATE INDEX IF NOT EXISTS idx_retirement_plans_user_id ON retirement_plans(user_id);

-- ==================== HELPER FUNCTIONS ====================

-- Function to get current usage for a user and feature
CREATE OR REPLACE FUNCTION get_current_usage(p_user_id uuid, p_feature_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month text;
  usage_count integer;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get usage for current month
  SELECT CASE 
    WHEN p_feature_key = 'fund_comparisons' THEN fund_comparisons
    WHEN p_feature_key = 'budget_alerts' THEN budget_alerts
    WHEN p_feature_key = 'portfolio_scenarios' THEN portfolio_scenarios
    WHEN p_feature_key = 'data_exports' THEN data_exports
    WHEN p_feature_key = 'fire_planning' THEN fire_planning
    WHEN p_feature_key = 'crisis_simulations' THEN crisis_simulations
    WHEN p_feature_key = 'retirement_plans' THEN retirement_plans
    WHEN p_feature_key = 'ai_interactions' THEN ai_interactions
    ELSE 0
  END INTO usage_count
  FROM usage_quotas
  WHERE user_id = p_user_id AND month_year = current_month;
  
  RETURN COALESCE(usage_count, 0);
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(p_user_id uuid, p_feature_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month text;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Insert or update usage quota
  INSERT INTO usage_quotas (user_id, month_year, fund_comparisons, budget_alerts, portfolio_scenarios, data_exports, fire_planning, crisis_simulations, retirement_plans, ai_interactions)
  VALUES (
    p_user_id, 
    current_month,
    CASE WHEN p_feature_key = 'fund_comparisons' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'budget_alerts' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'portfolio_scenarios' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'data_exports' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'fire_planning' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'crisis_simulations' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'retirement_plans' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_key = 'ai_interactions' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    fund_comparisons = usage_quotas.fund_comparisons + CASE WHEN p_feature_key = 'fund_comparisons' THEN 1 ELSE 0 END,
    budget_alerts = usage_quotas.budget_alerts + CASE WHEN p_feature_key = 'budget_alerts' THEN 1 ELSE 0 END,
    portfolio_scenarios = usage_quotas.portfolio_scenarios + CASE WHEN p_feature_key = 'portfolio_scenarios' THEN 1 ELSE 0 END,
    data_exports = usage_quotas.data_exports + CASE WHEN p_feature_key = 'data_exports' THEN 1 ELSE 0 END,
    fire_planning = usage_quotas.fire_planning + CASE WHEN p_feature_key = 'fire_planning' THEN 1 ELSE 0 END,
    crisis_simulations = usage_quotas.crisis_simulations + CASE WHEN p_feature_key = 'crisis_simulations' THEN 1 ELSE 0 END,
    retirement_plans = usage_quotas.retirement_plans + CASE WHEN p_feature_key = 'retirement_plans' THEN 1 ELSE 0 END,
    ai_interactions = usage_quotas.ai_interactions + CASE WHEN p_feature_key = 'ai_interactions' THEN 1 ELSE 0 END,
    updated_at = now();
    
  RETURN true;
END;
$$;

-- Function to check if user can use a feature
CREATE OR REPLACE FUNCTION can_use_feature(p_user_id uuid, p_feature_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan text;
  feature_limit integer;
  current_usage integer;
  result jsonb;
BEGIN
  -- Get user's current plan
  SELECT plan INTO user_plan
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  -- Default to free if no subscription found
  user_plan := COALESCE(user_plan, 'free');
  
  -- Get feature limit for user's plan
  SELECT limit_value INTO feature_limit
  FROM plan_features
  WHERE plan = user_plan AND feature_key = p_feature_key AND is_enabled = true;
  
  -- If feature not found or disabled, deny access
  IF feature_limit IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Recurso não disponível no seu plano'
    );
  END IF;
  
  -- If unlimited (-1), allow access
  IF feature_limit = -1 THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;
  
  -- Check current usage
  current_usage := get_current_usage(p_user_id, p_feature_key);
  
  -- Return result
  IF current_usage < feature_limit THEN
    RETURN jsonb_build_object('allowed', true);
  ELSE
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Limite mensal atingido (%s/%s)', current_usage, feature_limit)
    );
  END IF;
END;
$$;

-- ==================== SAMPLE DATA ====================

-- Insert plan features
INSERT INTO plan_features (plan, feature_key, is_enabled, limit_value) VALUES
-- Free Plan
('free', 'fund_comparisons', true, 2),
('free', 'budget_alerts', true, 3),
('free', 'portfolio_scenarios', false, 0),
('free', 'data_exports', true, 2),
('free', 'fire_planning', true, 1),
('free', 'crisis_simulations', false, 0),
('free', 'retirement_plans', false, 0),
('free', 'ai_interactions', true, 25),
('free', 'advanced_charts', false, 0),

-- Pro Plan
('pro', 'fund_comparisons', true, 5),
('pro', 'budget_alerts', true, 10),
('pro', 'portfolio_scenarios', true, 5),
('pro', 'data_exports', true, 10),
('pro', 'fire_planning', true, -1),
('pro', 'crisis_simulations', true, 3),
('pro', 'retirement_plans', true, 2),
('pro', 'ai_interactions', true, 100),
('pro', 'advanced_charts', true, 1),

-- Premium Plan
('premium', 'fund_comparisons', true, -1),
('premium', 'budget_alerts', true, -1),
('premium', 'portfolio_scenarios', true, -1),
('premium', 'data_exports', true, -1),
('premium', 'fire_planning', true, -1),
('premium', 'crisis_simulations', true, -1),
('premium', 'retirement_plans', true, -1),
('premium', 'ai_interactions', true, -1),
('premium', 'advanced_charts', true, -1),
('premium', 'api_access', true, 1),
('premium', 'priority_support', true, 1),
('premium', 'ai_narrative_reports', true, 1),
('premium', 'ai_auto_actions', true, 1)
ON CONFLICT (plan, feature_key) DO NOTHING;

-- Insert sample FX rates
INSERT INTO fx_rates (rate_date, base_currency, quote_currency, rate, source) VALUES
('2025-01-15', 'USD', 'BRL', 6.15, 'bcb'),
('2025-01-15', 'EUR', 'BRL', 6.45, 'bcb'),
('2025-01-15', 'USD', 'EUR', 0.95, 'ecb'),
('2025-01-15', 'GBP', 'BRL', 7.25, 'boe'),
('2025-01-15', 'CAD', 'BRL', 4.35, 'boc'),
('2025-01-15', 'AUD', 'BRL', 3.85, 'rba'),
('2025-01-15', 'CHF', 'BRL', 6.75, 'snb')
ON CONFLICT (rate_date, base_currency, quote_currency) DO NOTHING;

-- Insert real Brazilian funds
INSERT INTO funds (ticker, name, category, admin_fee, performance_fee, benchmark, risk_level, description, is_active) VALUES
-- FIIs (Real Estate Investment Funds)
('XPML11', 'XP Malls FII', 'FII', 1.00, NULL, 'IFIX', 3, 'Fundo de investimento imobiliário focado em shopping centers', true),
('HGLG11', 'CSHG Logística FII', 'FII', 0.70, NULL, 'IFIX', 3, 'Fundo focado em galpões logísticos e industriais', true),
('VISC11', 'Vinci Shopping Centers FII', 'FII', 0.75, NULL, 'IFIX', 3, 'Fundo de shopping centers da Vinci Partners', true),
('KNRI11', 'Kinea Renda Imobiliária FII', 'FII', 0.90, NULL, 'IFIX', 4, 'Fundo de recebíveis imobiliários', true),
('BCFF11', 'BTG Pactual Corporate FII', 'FII', 0.50, NULL, 'IFIX', 2, 'Fundo de edifícios corporativos', true),

-- ETFs and Index Funds
('IVVB11', 'iShares Core S&P 500 FII', 'Ações Internacionais', 0.30, NULL, 'S&P 500', 4, 'ETF que replica o índice S&P 500', true),
('BOVA11', 'iShares Ibovespa FII', 'Ações Nacionais', 0.50, NULL, 'Ibovespa', 5, 'ETF que replica o Ibovespa', true),
('SMAL11', 'iShares MSCI Brazil Small Cap FII', 'Ações Nacionais', 0.65, NULL, 'SMLL', 5, 'ETF de small caps brasileiras', true),
('DIVO11', 'CSHG Dividendos FII', 'Ações Nacionais', 0.50, NULL, 'IDIV', 4, 'ETF focado em ações pagadoras de dividendos', true),

-- Crypto and Alternative
('HASH11', 'Hashdex Nasdaq Crypto Index FII', 'Criptomoedas', 1.30, NULL, 'NASDAQ Crypto Index', 5, 'Primeiro ETF de criptomoedas do Brasil', true),
('QBTC11', 'QR Bitcoin FII', 'Criptomoedas', 0.75, NULL, 'Bitcoin', 5, 'ETF de Bitcoin', true),

-- Fixed Income
('IMAB11', 'iShares IMA-B FII', 'Renda Fixa', 0.30, NULL, 'IMA-B', 2, 'ETF de títulos públicos brasileiros', true),
('FIIP11', 'iShares IPCA+ FII', 'Renda Fixa', 0.35, NULL, 'IMA-B 5+', 2, 'ETF de títulos indexados ao IPCA', true)
ON CONFLICT (ticker) DO NOTHING;

-- Insert sample fund prices (last 12 months)
DO $$
DECLARE
  fund_record RECORD;
  price_date date;
  base_price numeric;
  price_variation numeric;
BEGIN
  FOR fund_record IN SELECT id, ticker FROM funds WHERE is_active = true LOOP
    -- Set base price based on fund type
    base_price := CASE 
      WHEN fund_record.ticker LIKE '%11' THEN 100.0 -- FIIs start at R$ 100
      ELSE 50.0 -- Other funds start at R$ 50
    END;
    
    -- Generate 12 months of price data
    FOR i IN 0..365 LOOP
      price_date := CURRENT_DATE - INTERVAL '1 day' * i;
      
      -- Add some realistic price variation
      price_variation := (random() - 0.5) * 0.02; -- ±1% daily variation
      base_price := base_price * (1 + price_variation);
      
      -- Ensure price doesn't go below 10
      base_price := GREATEST(base_price, 10.0);
      
      INSERT INTO fund_prices (fund_id, price_date, quota_value, net_worth)
      VALUES (
        fund_record.id,
        price_date,
        ROUND(base_price, 6),
        ROUND(base_price * (1000000 + random() * 9000000), 2) -- Random net worth
      )
      ON CONFLICT (fund_id, price_date) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Create demo user subscription (Pro plan with trial)
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Try to get the first user (assuming it's the demo user)
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
  
  IF demo_user_id IS NOT NULL THEN
    -- Insert subscription for demo user
    INSERT INTO subscriptions (
      user_id,
      plan,
      status,
      trial_end,
      current_period_end,
      stripe_customer_id
    ) VALUES (
      demo_user_id,
      'pro',
      'trialing',
      now() + INTERVAL '7 days',
      now() + INTERVAL '1 month',
      'cus_demo_' || substr(demo_user_id::text, 1, 8)
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan = 'pro',
      status = 'trialing',
      trial_end = now() + INTERVAL '7 days',
      current_period_end = now() + INTERVAL '1 month',
      updated_at = now();
    
    -- Initialize usage quota for current month
    INSERT INTO usage_quotas (
      user_id,
      month_year,
      fund_comparisons,
      ai_interactions
    ) VALUES (
      demo_user_id,
      to_char(now(), 'YYYY-MM'),
      2, -- Some usage to show in UI
      15 -- Some AI interactions used
    )
    ON CONFLICT (user_id, month_year) DO UPDATE SET
      fund_comparisons = 2,
      ai_interactions = 15,
      updated_at = now();
    
    -- Insert sample AI interactions
    INSERT INTO ai_interactions (
      user_id,
      session_id,
      interaction_type,
      user_query,
      ai_response,
      context_data,
      page_context,
      tokens_used,
      response_time_ms
    ) VALUES
    (
      demo_user_id,
      'session_' || extract(epoch from now()),
      'spending_analysis',
      'Como posso reduzir meus gastos mensais?',
      '{"analysis": "Analisando seus gastos, identifiquei 3 oportunidades principais...", "recommendations": [{"id": "1", "title": "Reduzir delivery", "description": "Economize R$ 300/mês cozinhando mais em casa"}]}',
      '{"monthlyExpenses": 4500, "categories": {"alimentacao": 800, "transporte": 600}}',
      'dashboard',
      1250,
      2300
    ),
    (
      demo_user_id,
      'session_' || extract(epoch from now()),
      'fire_planning',
      'Quando posso me aposentar?',
      '{"analysis": "Com seu perfil atual, você pode atingir FIRE em 18 anos...", "recommendations": [{"id": "1", "title": "Aumentar aportes", "description": "Adicione R$ 500/mês para acelerar em 3 anos"}]}',
      '{"currentWealth": 85000, "monthlyContribution": 2500}',
      'fire',
      1800,
      3100
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Update existing users table trigger to create subscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name, currency)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'BRL'
  );
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Initialize usage quota for current month
  INSERT INTO public.usage_quotas (user_id, month_year)
  VALUES (NEW.id, to_char(now(), 'YYYY-MM'));
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add update triggers for new tables
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_quotas_updated_at
  BEFORE UPDATE ON usage_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retirement_plans_updated_at
  BEFORE UPDATE ON retirement_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();