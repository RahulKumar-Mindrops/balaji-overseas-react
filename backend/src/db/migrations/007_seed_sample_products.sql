-- Sample products matching legacy demo item codes
INSERT INTO products (
  item_code, product_name, category, marble_type, color,
  thickness_mm, size_length_mm, size_width_mm, size_height_mm,
  has_wood, has_mdf, has_metal, has_glass, has_fabric, has_custom, is_active
)
VALUES
  ('MBL-TBL-001', 'Marble Top Dining Table', 'Furniture', 'Carrara White', 'White/Grey Veins',
   18, 1828.8, 914.4, NULL,
   1, 0, 1, 0, 0, 1, 1),
  ('MBL-VNT-002', 'Black Marble Vanity Unit', 'Bathroom', 'Nero Marquina', 'Black/Gold',
   20, 1219.2, 558.8, NULL,
   0, 1, 0, 0, 0, 1, 1),
  ('ONX-LMP-003', 'Onyx Backlit Panel', 'Decor', 'Honey Onyx', 'Amber/Cream',
   15, 609.6, 1219.2, NULL,
   0, 0, 1, 0, 0, 1, 1)
ON DUPLICATE KEY UPDATE
  product_name = VALUES(product_name),
  category = VALUES(category),
  marble_type = VALUES(marble_type),
  color = VALUES(color),
  thickness_mm = VALUES(thickness_mm),
  size_length_mm = VALUES(size_length_mm),
  size_width_mm = VALUES(size_width_mm),
  size_height_mm = VALUES(size_height_mm),
  has_wood = VALUES(has_wood),
  has_mdf = VALUES(has_mdf),
  has_metal = VALUES(has_metal),
  has_glass = VALUES(has_glass),
  has_fabric = VALUES(has_fabric),
  has_custom = VALUES(has_custom),
  is_active = VALUES(is_active);

INSERT INTO product_bom (product_id, raw_material_id, custom_material_name, custom_unit, quantity_per_unit, unit, bom_type)
SELECT p.id, rm.id, NULL, NULL, q.qty, q.u, 'PRODUCTION'
FROM products p
JOIN (
  SELECT 'MBL-TBL-001' AS item_code, 'RM-MAR-001' AS mat_code, 18 AS qty, 'sqft' AS u UNION ALL
  SELECT 'MBL-TBL-001', 'RM-WOD-001', 12, 'sqft' UNION ALL
  SELECT 'MBL-TBL-001', 'RM-MTL-001', 4, 'pcs' UNION ALL
  SELECT 'MBL-TBL-001', 'RM-MTL-002', 6, 'meter' UNION ALL
  SELECT 'MBL-TBL-001', 'RM-CNS-001', 0.5, 'kg' UNION ALL
  SELECT 'MBL-VNT-002', 'RM-MAR-002', 8, 'sqft' UNION ALL
  SELECT 'MBL-VNT-002', 'RM-MDF-001', 16, 'sqft' UNION ALL
  SELECT 'MBL-VNT-002', 'RM-FIT-001', 1, 'set' UNION ALL
  SELECT 'ONX-LMP-003', 'RM-MAR-003', 8, 'sqft' UNION ALL
  SELECT 'ONX-LMP-003', 'RM-MTL-003', 4, 'meter' UNION ALL
  SELECT 'ONX-LMP-003', 'RM-ELC-001', 5, 'meter'
) q ON p.item_code = q.item_code
JOIN raw_materials rm ON rm.material_code = q.mat_code
ON DUPLICATE KEY UPDATE
  quantity_per_unit = VALUES(quantity_per_unit),
  unit = VALUES(unit),
  bom_type = VALUES(bom_type);

INSERT INTO product_packing (product_id, packing_type, material_name, quantity, unit)
SELECT p.id, pt.packing_type, pt.material_name, pt.quantity, pt.unit
FROM products p
JOIN (
  SELECT 'MBL-TBL-001' AS item_code, 'CARTON' AS packing_type, 'Master carton' AS material_name, 1 AS quantity, 'pcs' AS unit UNION ALL
  SELECT 'MBL-TBL-001', 'INNER', 'Inner box', 2, 'pcs' UNION ALL
  SELECT 'MBL-TBL-001', 'BUBBLE', 'Bubble wrap', 0.5, 'meter' UNION ALL
  SELECT 'MBL-TBL-001', 'THERMOCOL', 'Corner inserts', 4, 'pcs' UNION ALL
  SELECT 'MBL-VNT-002', 'CARTON', 'Vanity carton', 1, 'pcs' UNION ALL
  SELECT 'MBL-VNT-002', 'INNER', 'Inner', 1, 'pcs' UNION ALL
  SELECT 'MBL-VNT-002', 'BUBBLE', 'Full wrap', 1, 'meter' UNION ALL
  SELECT 'MBL-VNT-002', 'THERMOCOL', 'Edge protection', 1, 'pcs' UNION ALL
  SELECT 'ONX-LMP-003', 'CARTON', 'Panel carton', 1, 'pcs' UNION ALL
  SELECT 'ONX-LMP-003', 'INNER', 'Inner', 1, 'pcs' UNION ALL
  SELECT 'ONX-LMP-003', 'BUBBLE', 'Full wrap', 1, 'meter' UNION ALL
  SELECT 'ONX-LMP-003', 'THERMOCOL', '6 sides', 1, 'pcs'
) pt ON p.item_code = pt.item_code
ON DUPLICATE KEY UPDATE
  material_name = VALUES(material_name),
  quantity = VALUES(quantity),
  unit = VALUES(unit);
