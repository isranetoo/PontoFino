@@ .. @@
      INSERT INTO fund_prices (fund_id, price_date, quota_value, net_worth)
      VALUES (
        fund_record.id,
        price_date,
-        ROUND(base_price, 6),
-        ROUND(base_price * (1000000 + random() * 9000000), 2) -- Random net worth
+        ROUND(base_price::numeric, 6),
+        ROUND((base_price * (1000000 + random() * 9000000))::numeric, 2) -- Random net worth
      )
      ON CONFLICT (fund_id, price_date) DO NOTHING;