import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: number
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense' | 'transfer'
          color: string
          icon: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          amount: number
          description: string
          transaction_date: string
          type: 'income' | 'expense' | 'transfer'
          transfer_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: string
          start_date: string
          end_date: string | null
          spent: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string | null
          category: string
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
      assets: {
        Row: {
          id: string
          ticker: string
          name: string
          asset_class: string
          currency: string
          metadata: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      portfolio_positions: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          quantity: number
          price: number
          purchase_date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['portfolio_positions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['portfolio_positions']['Insert']>
      }
      funds: {
        Row: {
          id: string
          ticker: string
          name: string
          category: string
          admin_fee: number
          performance_fee: number | null
          benchmark: string
          risk_level: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['funds']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['funds']['Insert']>
      }
      fund_prices: {
        Row: {
          id: string
          fund_id: string
          price_date: string
          quota_value: number
          net_worth: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fund_prices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fund_prices']['Insert']>
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          fund_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['watchlists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['watchlists']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'premium'
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          trial_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      usage_quotas: {
        Row: {
          id: string
          user_id: string
          month: string
          fund_comparisons: number
          budget_alerts: number
          crisis_simulations: number
          retirement_plans: number
          api_calls: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['usage_quotas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['usage_quotas']['Insert']>
      }
      fx_rates: {
        Row: {
          date: string
          base: string
          quote: string
          rate: number
        }
        Insert: Database['public']['Tables']['fx_rates']['Row']
        Update: Partial<Database['public']['Tables']['fx_rates']['Insert']>
      }
      retirement_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          base_currency: string
          spend_currency: string
          spend_monthly: number
          inflation_spend_aa: number
          years: number
          swr_aa: number
          incomes: any
          portfolio: any
          fx_assumptions: any | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['retirement_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['retirement_plans']['Insert']>
      }
      retirement_results: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          ruined: boolean
          series: any
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['retirement_results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['retirement_results']['Insert']>
      }
      planning_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          base_currency: string
          monthly_expenses: number
          monthly_contribution: number
          current_wealth: number
          exp_inflation_aa: number
          exp_return_real_aa: number
          safe_withdrawal_rate: number
          tax_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['planning_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['planning_profiles']['Insert']>
      }
      planning_results: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          horizon_months: number
          target_wealth_real: number
          target_wealth_nominal: number
          series: any
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['planning_results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['planning_results']['Insert']>
      }
      planning_scenarios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          input_json: any
          result_json: any
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['planning_scenarios']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['planning_scenarios']['Insert']>
      }
    }
  }
}