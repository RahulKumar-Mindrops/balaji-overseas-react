export const ALLOWED_UNITS = ['sqft', 'sqmtr', 'pcs', 'kg', 'meter', 'set', 'liter']

export const BOM_TYPES = ['PRODUCTION', 'PACKING', 'FINISHING', 'CUSTOM']

export const PACKING_TYPES = ['CARTON', 'INNER', 'BUBBLE', 'THERMOCOL']

/** SRS item_code: XX-XXX-000 (alphanumeric segments) */
export const ITEM_CODE_REGEX = /^[A-Z0-9]{2,}-[A-Z0-9]{3}-[0-9]{3}$/
