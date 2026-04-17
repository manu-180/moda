CREATE TABLE IF NOT EXISTS order_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE,
  actor_email text,
  action      text NOT NULL,
  from_value  text,
  to_value    text,
  changed_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_order_id ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON order_audit_log(changed_at DESC);

ALTER TABLE order_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read audit log" ON order_audit_log FOR SELECT TO authenticated USING (is_admin());

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_audit_log (order_id, action, from_value, to_value)
    VALUES (NEW.id, 'status_change', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_status_change ON orders;
CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
