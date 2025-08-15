/*
  # Financial Independence (FIRE) Planner Tables

  1. New Tables
    - `planning_profiles` - User FIRE planning profiles with parameters
    - `planning_results` - Calculated FIRE planning results with projections

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data

  3. Features
    - Store user planning parameters (expenses, contributions, returns, etc.)
    - Store calculation results with wealth projection series
    - Support for multiple planning scenarios per user
*/

-- Planning profiles table
CREATE TABLE IF NOT EXISTS planning_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My FIRE Plan',
  base_currency text NOT NULL DEFAULT 'BRL',
  monthly_expenses numeric(15,2) NOT NULL,
  monthly_contribution numeric(15,2) NOT NULL,
  current_wealth numeric(15,2) NOT NULL DEFAULT 0,
  exp_inflation_aa numeric(5,4) NOT NULL, -- expected inflation (annual)
  exp_return_real_aa numeric(5,4) NOT NULL, -- expected real return (annual)
  safe_withdrawal_rate numeric(5,4) NOT NULL, -- SWR (annual, real)
  tax_rate numeric(5,4) NOT NULL DEFAULT 0, -- average tax rate
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Planning results table
CREATE TABLE IF NOT EXISTS planning_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES planning_profiles(id) ON DELETE CASCADE,
  horizon_months integer NOT NULL,
  target_wealth_real numeric(15,2) NOT NULL,
  target_wealth_nominal numeric(15,2) NOT NULL,
  series jsonb NOT NULL, -- [{month, wealth_nominal, wealth_real}]
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE planning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for planning_profiles
CREATE POLICY "Users can manage own planning profiles"
  ON planning_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for planning_results
CREATE POLICY "Users can manage own planning results"
  ON planning_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_planning_profiles_user_id ON planning_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_results_user_id ON planning_results(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_results_profile_id ON planning_results(profile_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_planning_profiles_updated_at 
  BEFORE UPDATE ON planning_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();