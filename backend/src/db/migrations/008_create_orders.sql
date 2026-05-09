CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(80) UNIQUE NOT NULL,
  client_name VARCHAR(200) NOT NULL,
  order_date DATE,
  shipment_date DATE,
  status VARCHAR(50) DEFAULT 'Material Planning' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shipment_date ON orders(shipment_date);

