const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// middleware
const verifyToken = require("../middleware/auth");

// Add Product route (Accepts multipart/form-data for product_image file upload)
router.post("/", verifyToken, upload.array("product_images", 3), addProduct);

// Get All Products route
router.get("/", getAllProducts);

// Get Single Product route
router.get("/:id", getProductById);

// Update Product route (Accepts optional product_image file upload replacement)
router.put("/:id", verifyToken, upload.array("product_images", 3), updateProduct);

// Delete Product route
router.delete("/:id", verifyToken, deleteProduct);

module.exports = router;
