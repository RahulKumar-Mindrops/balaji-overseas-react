CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  marble_type VARCHAR(100),
  color VARCHAR(100),
  thickness_mm DECIMAL(8,2),
  size_length_mm DECIMAL(8,2),
  size_width_mm DECIMAL(8,2),
  size_height_mm DECIMAL(8,2),
  has_wood TINYINT(1) DEFAULT 0,
  has_mdf TINYINT(1) DEFAULT 0,
  has_metal TINYINT(1) DEFAULT 0,
  has_glass TINYINT(1) DEFAULT 0,
  has_fabric TINYINT(1) DEFAULT 0,
  has_custom TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
