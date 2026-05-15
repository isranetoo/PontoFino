-- ============================================================
-- DASHBOARD: Functions adicionais para dados reais
-- Migration: 002_dashboard_functions
-- Rodar no SQL Editor do Supabase depois da 001
-- ============================================================


-- 1. Alocação por classe de ativo (para gráfico de pizza)
-- Retorna o valor total e % por asset_class do consultor logado
create or replace function public.get_allocation_by_class()
returns json as $$
declare
  v_result json;
begin
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_result
  from (
    select
      pa.asset_class as classe,
      sum(pa.current_value) as valor,
      case
        when sum(sum(pa.current_value)) over () > 0
        then round((sum(pa.current_value) / sum(sum(pa.current_value)) over ()) * 100, 1)
        else 0
      end as percentual
    from public.portfolio_assets pa
    inner join public.portfolios p on p.id = pa.portfolio_id
    where p.consultant_id = auth.uid()
      and p.is_active = true
    group by pa.asset_class
    order by sum(pa.current_value) desc
  ) t;

  return v_result;
end;
$$ language plpgsql security definer;


-- 2. Carteiras desbalanceadas (desvio > 5pp entre atual e meta)
-- Retorna carteiras onde algum ativo desvia mais de 5 pontos percentuais
create or replace function public.get_unbalanced_portfolios()
returns json as $$
declare
  v_result json;
begin
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_result
  from (
    select
      p.id as portfolio_id,
      p.name as portfolio_name,
      c.full_name as client_name,
      p.total_value,
      max(abs(
        case when p.total_value > 0
          then (pa.current_value / p.total_value) - pa.target_pct
          else 0
        end
      )) as max_desvio,
      count(pa.id) as total_assets
    from public.portfolios p
    inner join public.clients c on c.id = p.client_id
    inner join public.portfolio_assets pa on pa.portfolio_id = p.id
    where p.consultant_id = auth.uid()
      and p.is_active = true
    group by p.id, p.name, c.full_name, p.total_value
    having max(abs(
      case when p.total_value > 0
        then (pa.current_value / p.total_value) - pa.target_pct
        else 0
      end
    )) > 0.05
    order by max_desvio desc
    limit 5
  ) t;

  return v_result;
end;
$$ language plpgsql security definer;


-- 3. Comissões dos últimos 6 meses (para gráfico de barras)
create or replace function public.get_commissions_last_6_months()
returns json as $$
declare
  v_result json;
begin
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_result
  from (
    select
      reference_period as periodo,
      sum(amount) as total,
      count(*) as qtd
    from public.commissions
    where consultant_id = auth.uid()
      and reference_period >= to_char(now() - interval '6 months', 'YYYY-MM')
    group by reference_period
    order by reference_period asc
  ) t;

  return v_result;
end;
$$ language plpgsql security definer;


-- 4. Top 5 clientes por AUM (para ranking no dashboard)
create or replace function public.get_top_clients_by_aum()
returns json as $$
declare
  v_result json;
begin
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_result
  from (
    select
      c.id,
      c.full_name,
      c.email,
      c.risk_profile,
      coalesce(sum(p.total_value), 0) as aum,
      count(p.id) as total_portfolios
    from public.clients c
    left join public.portfolios p on p.client_id = c.id and p.is_active = true
    where c.consultant_id = auth.uid()
      and c.is_active = true
    group by c.id, c.full_name, c.email, c.risk_profile
    order by aum desc
    limit 5
  ) t;

  return v_result;
end;
$$ language plpgsql security definer;


-- 5. Atividade recente (últimas 10 ações do consultor no audit log)
create or replace function public.get_recent_activity()
returns json as $$
declare
  v_result json;
begin
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_result
  from (
    select
      action,
      table_name,
      record_id,
      created_at,
      case
        when new_data->>'full_name' is not null then new_data->>'full_name'
        when new_data->>'asset_name' is not null then new_data->>'asset_name'
        when new_data->>'name' is not null then new_data->>'name'
        else null
      end as entity_name
    from public.audit_logs
    where user_id = auth.uid()
    order by created_at desc
    limit 10
  ) t;

  return v_result;
end;
$$ language plpgsql security definer;
