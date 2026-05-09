CREATE TABLE IF NOT EXISTS order_bom_overrides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  bom_id INT NOT NULL,
  overridden_qty DECIMAL(10,4) NOT NULL CHECK (overridden_qty > 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_item_id, bom_id)
);

CREATE INDEX IF NOT EXISTS idx_order_bom_overrides_item ON order_bom_overrides(order_item_id);

ALTER TABLE order_bom_overrides
  ADD CONSTRAINT fk_override_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE;

ALTER TABLE order_bom_overrides
  ADD CONSTRAINT fk_override_bom FOREIGN KEY (bom_id) REFERENCES product_bom(id) ON DELETE CASCADE;

