/* -----------------------------
   Positions: user-scoped view
------------------------------*/
DROP VIEW IF EXISTS vpositionuser;

CREATE VIEW vpositionuser AS
SELECT
  t.clerkUserId AS clerkUserId,
  a.symbol      AS symbol,
  COALESCE(SUM(
    CASE
      WHEN t.side = 'BUY'  THEN  t.quantity
      WHEN t.side = 'SELL' THEN -t.quantity
      ELSE 0
    END
  ), 0) AS qty,

  CASE
    WHEN COALESCE(SUM(CASE WHEN t.side='BUY' THEN t.quantity END), 0) = 0 THEN NULL
    ELSE
      SUM(CASE WHEN t.side='BUY' THEN t.quantity * t.price END)
      / NULLIF(SUM(CASE WHEN t.side='BUY' THEN t.quantity END), 0)
  END AS costbasis
FROM asset a
JOIN txn t ON t.assetId = a.assetId
GROUP BY t.clerkUserId, a.symbol;
