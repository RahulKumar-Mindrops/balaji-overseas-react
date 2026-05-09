CREATE TABLE IF NOT EXISTS product_packing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  packing_type VARCHAR(50) NOT NULL,
  material_name VARCHAR(200),
  quantity DECIMAL(10,4),
  unit VARCHAR(20),
  notes TEXT,
  CONSTRAINT packing_type_check CHECK (
    packing_type IN ('CARTON', 'INNER', 'BUBBLE', 'THERMOCOL')
  )
);

CREATE INDEX IF NOT EXISTS idx_product_packing_product ON product_packing(product_id);

ALTER TABLE product_packing
  ADD CONSTRAINT fk_packing_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
