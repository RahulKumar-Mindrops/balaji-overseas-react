-- One row per master raw material for MRP shortage checks.
CREATE TABLE IF NOT EXISTS inventory_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raw_material_id INT NOT NULL UNIQUE,
  quantity_on_hand DECIMAL(14,4) NOT NULL DEFAULT 0,
  min_stock_level DECIMAL(14,4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_raw ON inventory_stock(raw_material_id);

ALTER TABLE inventory_stock
  ADD CONSTRAINT fk_inventory_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE;
