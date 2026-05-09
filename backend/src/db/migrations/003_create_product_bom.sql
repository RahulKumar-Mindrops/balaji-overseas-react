CREATE TABLE IF NOT EXISTS product_bom (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  raw_material_id INT,
  custom_material_name VARCHAR(200),
  custom_unit VARCHAR(20),
  quantity_per_unit DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  bom_type VARCHAR(30) DEFAULT 'PRODUCTION' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bom_material_check CHECK (
    raw_material_id IS NOT NULL OR custom_material_name IS NOT NULL
  ),
  CONSTRAINT bom_type_check CHECK (
    bom_type IN ('PRODUCTION', 'PACKING', 'FINISHING', 'CUSTOM')
  )
);

CREATE INDEX IF NOT EXISTS idx_product_bom_product ON product_bom(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_product_bom_product_material ON product_bom(product_id, raw_material_id);

ALTER TABLE product_bom
  ADD CONSTRAINT fk_bom_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_bom
  ADD CONSTRAINT fk_bom_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id);
