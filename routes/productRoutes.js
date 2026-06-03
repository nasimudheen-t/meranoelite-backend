const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// middleware
const verifyToken = require('../middleware/auth');

// Add Product route (Accepts multipart/form-data for product_image file upload)
router.post('/',verifyToken, upload.single('product_image'), addProduct);

// Get All Products route
router.get('/', getAllProducts);

// Get Single Product route
router.get('/:id', getProductById);

// Update Product route (Accepts optional product_image file upload replacement)
router.put('/:id',verifyToken, upload.single('product_image'), updateProduct);

// Delete Product route
router.delete('/:id',verifyToken, deleteProduct);



module.exports = router;
