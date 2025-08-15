/*
  # Crisis Scenario Simulation Tables

  1. New Tables
    - `portfolio_positions` - User's investment positions
    - `assets` - Asset metadata with sensitivities
    - `planning_scenarios` - Saved crisis scenarios

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage own data

  3. Features
    - Store asset sensitivities (beta, duration, etc.)
    - Save and load crisis scenarios
    - Track portfolio positions for simulation
*/

-- Portfolio positions table
CREATE TABLE IF NOT EXISTS portfolio_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL,
  quantity numeric(15,6) NOT NULL DEFAULT 0,
  price numeric(15,2) NOT NULL DEFAULT 0,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own positions"
  ON portfolio_positions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Assets metadata table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  name text NOT NULL,
  asset_class text NOT NULL CHECK (asset_class IN ('Equity', 'Bond', 'FII', 'Cash', 'FX', 'Crypto')),
  currency text NOT NULL DEFAULT 'BRL',
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets are publicly readable"
  ON assets
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Add foreign key constraint
ALTER TABLE portfolio_positions 
ADD CONSTRAINT portfolio_positions_asset_id_fkey 
FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

-- Planning scenarios table
CREATE TABLE IF NOT EXISTS planning_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  input_json jsonb NOT NULL,
  result_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE planning_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scenarios"
  ON planning_scenarios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_user_id ON portfolio_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_ticker ON assets(ticker);
CREATE INDEX IF NOT EXISTS idx_assets_class ON assets(asset_class);
CREATE INDEX IF NOT EXISTS idx_planning_scenarios_user_id ON planning_scenarios(user_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolio_positions_updated_at
  BEFORE UPDATE ON portfolio_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample assets with sensitivities
INSERT INTO assets (ticker, name, asset_class, currency, metadata) VALUES
('PETR4', 'Petrobras PN', 'Equity', 'BRL', '{"beta": 1.2, "sector": "Energy"}'),
('VALE3', 'Vale ON', 'Equity', 'BRL', '{"beta": 1.1, "sector": "Materials"}'),
('ITUB4', 'Itaú Unibanco PN', 'Equity', 'BRL', '{"beta": 1.0, "sector": "Financials"}'),
('XPML11', 'XP Malls FII', 'FII', 'BRL', '{"beta_ifix": 0.8, "duration_like": 2.5}'),
('HGLG11', 'CSHG Logística FII', 'FII', 'BRL', '{"beta_ifix": 0.9, "duration_like": 3.0}'),
('NTNB-2035', 'Tesouro IPCA+ 2035', 'Bond', 'BRL', '{"duration_years": 8.5, "duration_mod": 8.2}'),
('LTN-2027', 'Tesouro Prefixado 2027', 'Bond', 'BRL', '{"duration_years": 3.2, "duration_mod": 3.1}'),
('IVVB11', 'iShares S&P 500 FII', 'Equity', 'USD', '{"beta": 1.0, "tracks": "S&P 500"}'),
('BTC', 'Bitcoin', 'Crypto', 'USD', '{"beta": 2.5, "volatility": 0.8}'),
('CDI', 'CDI', 'Cash', 'BRL', '{"duration_years": 0.1, "duration_mod": 0.1}')
ON CONFLICT (ticker) DO NOTHING;