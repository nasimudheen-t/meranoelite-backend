# Product Management System Backend API

A complete, production-ready Node.js and Express RESTful API for managing products, featuring MySQL database storage, Multer file upload integration, custom validations, and robust error handling.

---

## 🛠️ Tech Stack
*   **Core:** Node.js, Express.js
*   **Database:** MySQL (using promise-based `mysql2` pool)
*   **File Uploads:** Multer
*   **Environment Configuration:** dotenv
*   **CORS Support:** cors
*   **Development Tools:** nodemon

---

## 📁 Project Directory Structure
```text
project/
│
├── config/
│   └── db.js                  # MySQL Database Pool Connection
├── controllers/
│   └── productController.js   # CRUD Logic & File Cleanups
├── middleware/
│   └── upload.js              # Multer configuration & Filters
├── routes/
│   └── productRoutes.js       # Express Router Configuration
├── uploads/                   # Folder holding uploaded images
├── .env                       # Environment Variables Configuration
├── package.json               # Project Dependencies & Scripts
├── postman_collection.json    # Importable Postman Test Suite
├── schema.sql                 # SQL Schema Table Creation
├── server.js                  # Main Application Entry Point
└── README.md                  # Project Documentation
```

---

## 🚀 Setup and Installation

### 1. Database Setup
Ensure you have **MySQL** server running on your machine.
1. Connect to your MySQL server using your client/terminal.
2. Run the initialization statements inside [schema.sql](file:///c:/Users/comna/OneDrive/Desktop/PROJECTS/bulb-shop/backend/schema.sql) to create the database and table:
   ```sql
   CREATE DATABASE IF NOT EXISTS products_db;
   USE products_db;

   CREATE TABLE IF NOT EXISTS products (
       id INT AUTO_INCREMENT PRIMARY KEY,
       product_name VARCHAR(255) NOT NULL,
       product_description TEXT,
       product_image VARCHAR(500) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 2. Configure Environment Variables
Open the [.env](file:///c:/Users/comna/OneDrive/Desktop/PROJECTS/bulb-shop/backend/.env) file at the root level and verify/update your MySQL server credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=products_db
```

### 3. Install Dependencies
Run the command below in your project folder to install all packages:
```bash
npm install
```

### 4. Start the Application
Run the development environment using `nodemon`:
```bash
npm run dev
```
The server will check the MySQL database connection pool, initialize, and run on `http://localhost:5000`.

---

## 📡 API Endpoints & Postman Integration

This project includes a pre-configured [postman_collection.json](file:///c:/Users/comna/OneDrive/Desktop/PROJECTS/bulb-shop/backend/postman_collection.json) file that you can import directly into **Postman**:
1. Open Postman.
2. Click **Import** at the top left.
3. Choose the [postman_collection.json](file:///c:/Users/comna/OneDrive/Desktop/PROJECTS/bulb-shop/backend/postman_collection.json) file from this project root folder.
4. Now you'll have all standard product API routes mapped and ready to click-and-run!

---

### Endpoints Specification

#### 1. Add Product
*   **Route:** `POST /api/products`
*   **Body Content Type:** `multipart/form-data`
*   **Fields:**
    *   `product_name` (Text, Required)
    *   `product_description` (Text, Optional)
    *   `product_image` (File, Required - Allowed: `jpg`, `jpeg`, `png`, `webp`. Max size: 5MB)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Product created successfully",
      "data": {
        "id": 1,
        "product_name": "Smart LED Bulb",
        "product_description": "WiFi connected smart RGB LED bulb with dimming features.",
        "product_image": "uploads/1622630045123.png",
        "created_at": "2026-06-02T09:10:45.000Z"
      }
    }
    ```

#### 2. Get All Products
*   **Route:** `GET /api/products`
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Products retrieved successfully",
      "data": [
        {
          "id": 1,
          "product_name": "Smart LED Bulb",
          "product_description": "WiFi connected smart RGB LED bulb with dimming features.",
          "product_image": "uploads/1622630045123.png",
          "created_at": "2026-06-02T09:10:45.000Z"
        }
      ]
    }
    ```

#### 3. Get Single Product
*   **Route:** `GET /api/products/:id`
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product retrieved successfully",
      "data": {
        "id": 1,
        "product_name": "Smart LED Bulb",
        "product_description": "WiFi connected smart RGB LED bulb.",
        "product_image": "uploads/1622630045123.png",
        "created_at": "2026-06-02T09:10:45.000Z"
      }
    }
    ```
*   **Not Found Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }
    ```

#### 4. Update Product
*   **Route:** `PUT /api/products/:id`
*   **Body Content Type:** `multipart/form-data`
*   **Fields:**
    *   `product_name` (Text, Optional)
    *   `product_description` (Text, Optional)
    *   `product_image` (File, Optional - Replacing will delete the old image file automatically)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product updated successfully",
      "data": {
        "id": 1,
        "product_name": "Smart LED Bulb V2",
        "product_description": "Upgraded smart bulb with sound controllers.",
        "product_image": "uploads/1622635591234.png",
        "created_at": "2026-06-02T09:10:45.000Z"
      }
    }
    ```

#### 5. Delete Product
*   **Route:** `DELETE /api/products/:id`
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product deleted successfully",
      "data": {}
    }
    ```

#### 6. Static File Access
Uploaded images are stored under `uploads/` folder and accessible in your web browser or front-end using:
`http://localhost:5000/uploads/<filename>` (e.g. `http://localhost:5000/uploads/1622630045123.png`).

---

## 🛡️ Error Handling Responses

If an invalid file extension is uploaded, size limit (5MB) is exceeded, or database errors occur, the backend intercepts and returns descriptive HTTP statuses with consistent JSON structures:

**Example: Invalid File Extension (400 Bad Request)**
```json
{
  "success": false,
  "message": "Only .png, .jpg, .jpeg and .webp formats are allowed!"
}
```

**Example: File Size Limit Exceeded (400 Bad Request)**
```json
{
  "success": false,
  "message": "Upload error: File too large"
}
```

**Example: Internal Server/Database Error (500 Server Error)**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
