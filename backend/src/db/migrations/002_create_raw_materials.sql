CREATE TABLE IF NOT EXISTS raw_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_code VARCHAR(50) UNIQUE NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) NOT NULL,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_raw_materials_category ON raw_materials(category);
CREATE INDEX IF NOT EXISTS idx_raw_materials_is_active ON raw_materials(is_active);
