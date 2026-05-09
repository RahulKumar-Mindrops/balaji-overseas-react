INSERT INTO raw_materials (material_code, material_name, category, unit, description, is_active)
VALUES
  ('RM-MAR-001', 'Carrara Marble Slab', 'Marble', 'sqft', NULL, 1),
  ('RM-MAR-002', 'Nero Marquina Marble', 'Marble', 'sqft', NULL, 1),
  ('RM-MAR-003', 'Honey Onyx Slab', 'Marble', 'sqft', NULL, 1),
  ('RM-WOD-001', 'Teak Wood Planks', 'Wood', 'sqft', NULL, 1),
  ('RM-MDF-001', '18mm MDF Board', 'MDF', 'sqft', NULL, 1),
  ('RM-MTL-001', 'SS Pipes (40mm)', 'Metal', 'pcs', NULL, 1),
  ('RM-MTL-002', 'Brass Inlay Strip', 'Metal', 'meter', NULL, 1),
  ('RM-FIT-001', 'Gold PVD Fittings', 'Fittings', 'set', NULL, 1),
  ('RM-ELC-001', 'LED Strip 24V', 'Electrical', 'meter', NULL, 1),
  ('RM-CNS-001', 'Epoxy Adhesive', 'Consumable', 'kg', NULL, 1),
  ('RM-MTL-003', 'Aluminium Profile', 'Metal', 'meter', NULL, 1)
ON DUPLICATE KEY UPDATE
  material_name = VALUES(material_name),
  category = VALUES(category),
  unit = VALUES(unit),
  description = VALUES(description),
  is_active = VALUES(is_active);

INSERT INTO inventory_stock (raw_material_id, quantity_on_hand, min_stock_level)
SELECT rm.id,
  CASE rm.material_code
    WHEN 'RM-MAR-001' THEN 150 WHEN 'RM-MAR-002' THEN 80 WHEN 'RM-MAR-003' THEN 240
    WHEN 'RM-WOD-001' THEN 90 WHEN 'RM-MDF-001' THEN 300 WHEN 'RM-MTL-001' THEN 60
    WHEN 'RM-MTL-002' THEN 30 WHEN 'RM-FIT-001' THEN 12 WHEN 'RM-ELC-001' THEN 40
    WHEN 'RM-CNS-001' THEN 25 WHEN 'RM-MTL-003' THEN 80
    ELSE 0
  END,
  CASE rm.material_code
    WHEN 'RM-MAR-001' THEN 200 WHEN 'RM-MAR-002' THEN 50 WHEN 'RM-MAR-003' THEN 100
    WHEN 'RM-WOD-001' THEN 80 WHEN 'RM-MDF-001' THEN 150 WHEN 'RM-MTL-001' THEN 50
    WHEN 'RM-MTL-002' THEN 50 WHEN 'RM-FIT-001' THEN 10 WHEN 'RM-ELC-001' THEN 60
    WHEN 'RM-CNS-001' THEN 10 WHEN 'RM-MTL-003' THEN 40
    ELSE 0
  END
FROM raw_materials rm
ON DUPLICATE KEY UPDATE
  quantity_on_hand = VALUES(quantity_on_hand),
  min_stock_level = VALUES(min_stock_level);
