-- Fix: orders were readable by everyone. Restrict to owner only.
DROP POLICY IF EXISTS "Orders are queryable by stripe session id" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
