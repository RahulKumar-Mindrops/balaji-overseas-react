<<<<<<< HEAD
# Balaji Overseas (React + API)

Export/manufacturing dashboard with a **MySQL + Express** product profile API and a **Vite + React** frontend.

## Prerequisites

- Node.js 18+
- MySQL Server 8+ (via MySQL Workbench)

## Database (MySQL)

1. Ensure **MySQL Server is running** (Windows service `MySQL80`).
2. Create a database named `balaji_overseas` (or change `MYSQL_DATABASE` in `backend/.env`).
3. Copy `backend/.env.example` to `backend/.env` and set:

   - `MYSQL_HOST=localhost`
   - `MYSQL_PORT=3306`
   - `MYSQL_USER=root`
   - `MYSQL_PASSWORD=...`
   - `MYSQL_DATABASE=balaji_overseas`

4. Run migrations:

   ```bash
   cd backend
   npm install
   npm run migrate
   ```

   This creates `products`, `raw_materials`, `product_bom`, `product_packing`, `inventory_stock`, `orders`, `order_items`, `order_bom_overrides`, and seed data (sample materials, inventory, and products aligned with the demo orders).

## Run the API

```bash
cd backend
npm run dev
```

Default port: **3001**. Health check: `GET http://localhost:3001/health`

## Run the web app

```bash
npm install
npm run dev
```

The Vite dev server proxies **`/api`** to `http://localhost:3001`, so the UI calls `/api/v1/...` without CORS issues.

### Run API and web together

```bash
npm run dev:full
```

## API overview

- `GET/POST /api/v1/materials`, `PUT /api/v1/materials/:id`
- `GET /api/v1/products` (pagination, `q`, `category`, `include_inactive`)
- `GET /api/v1/products/search?q=...`
- `GET /api/v1/products/suggest-item-code?category=...&material_key=...`
- `GET/POST/PUT/DELETE /api/v1/products/:id` (delete = soft deactivate)
- `GET/POST/PUT/DELETE /api/v1/products/:productId/bom/...`, `POST .../bom/bulk`
- `POST /api/v1/mrp/calculate` with body `{ "items": [{ "item_code": "MBL-TBL-001", "quantity": 10 }] }` or `{ "product_id": 1, "quantity": 10 }`

## Production API URL

Set `VITE_API_URL` in the frontend `.env` if the API is not served under the same origin (see root `.env.example`).
=======
# Balaji Overseas (React + API)

Export/manufacturing dashboard with a **MySQL + Express** product profile API and a **Vite + React** frontend.

## Prerequisites

- Node.js 18+
- MySQL Server 8+ (via MySQL Workbench)

## Database (MySQL)

1. Ensure **MySQL Server is running** (Windows service `MySQL80`).
2. Create a database named `balaji_overseas` (or change `MYSQL_DATABASE` in `backend/.env`).
3. Copy `backend/.env.example` to `backend/.env` and set:

   - `MYSQL_HOST=localhost`
   - `MYSQL_PORT=3306`
   - `MYSQL_USER=root`
   - `MYSQL_PASSWORD=...`
   - `MYSQL_DATABASE=balaji_overseas`

4. Run migrations:

   ```bash
   cd backend
   npm install
   npm run migrate
   ```

   This creates `products`, `raw_materials`, `product_bom`, `product_packing`, `inventory_stock`, `orders`, `order_items`, `order_bom_overrides`, and seed data (sample materials, inventory, and products aligned with the demo orders).

## Run the API

```bash
cd backend
npm run dev
```

Default port: **3001**. Health check: `GET http://localhost:3001/health`

## Run the web app

```bash
npm install
npm run dev
```

The Vite dev server proxies **`/api`** to `http://localhost:3001`, so the UI calls `/api/v1/...` without CORS issues.

### Run API and web together

```bash
npm run dev:full
```

## API overview

- `GET/POST /api/v1/materials`, `PUT /api/v1/materials/:id`
- `GET /api/v1/products` (pagination, `q`, `category`, `include_inactive`)
- `GET /api/v1/products/search?q=...`
- `GET /api/v1/products/suggest-item-code?category=...&material_key=...`
- `GET/POST/PUT/DELETE /api/v1/products/:id` (delete = soft deactivate)
- `GET/POST/PUT/DELETE /api/v1/products/:productId/bom/...`, `POST .../bom/bulk`
- `POST /api/v1/mrp/calculate` with body `{ "items": [{ "item_code": "MBL-TBL-001", "quantity": 10 }] }` or `{ "product_id": 1, "quantity": 10 }`

## Production API URL

Set `VITE_API_URL` in the frontend `.env` if the API is not served under the same origin (see root `.env.example`).
>>>>>>> 84a36cc3da30eb976825f78b23abc93515549191
