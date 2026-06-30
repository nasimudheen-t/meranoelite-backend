const db = require("../config/db");
const fs = require("fs");
const path = require("path");

/**
 * Add a new product
 * POST /api/products
 */
const addProduct = async (req, res) => {
  try {
    const { product_name, product_description, category, subcategory } =
      req.body;

    if (!product_name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const productImages = req.files.map((file) => file.path);

    const [result] = await db.query(
      `INSERT INTO products
      (
        product_name,
        product_description,
        product_images,
        category,
        subcategory
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        product_name,
        product_description || null,
        JSON.stringify(productImages),
        category || null,
        subcategory || null,
      ],
    );

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get all products (newest first)
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC",
    );
    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_description, category, subcategory } = req.body;

    // Get current product
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      // Clean up uploaded files if product not found
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(err);
          }
        });
      }
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const currentProduct = rows[0];
    
    // Parse existing images (handle both string and array)
    let existingImages = [];
    try {
      if (currentProduct.product_images) {
        existingImages = typeof currentProduct.product_images === 'string' 
          ? JSON.parse(currentProduct.product_images) 
          : currentProduct.product_images;
      }
    } catch (e) {
      existingImages = [];
    }

    // Handle multiple images
    let oldImagesToDelete = [];
    let newImages = [];

    if (req.files && req.files.length > 0) {
      // Save old images for deletion
      oldImagesToDelete = [...existingImages];
      
      // Create new image paths
      newImages = req.files.map(file => `uploads/${file.filename}`);
      
      // Combine: Keep existing images that weren't replaced + new ones
      // Note: If you want to replace all images, use only newImages
      // If you want to add to existing, uncomment the line below
      // newImages = [...existingImages, ...newImages];
    } else {
      // If no new files, keep existing images
      newImages = existingImages;
    }

    // Update fields
    const updatedName = product_name !== undefined ? product_name : currentProduct.product_name;
    const updatedDescription = product_description !== undefined 
      ? product_description 
      : currentProduct.product_description;
    const updatedCategory = category !== undefined ? category : currentProduct.category;
    const updatedSubcategory = subcategory !== undefined ? subcategory : currentProduct.subcategory;

    // Validate product name
    if (!updatedName) {
      // Clean up uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(err);
          }
        });
      }
      return res.status(400).json({
        success: false,
        message: "Product name cannot be empty",
      });
    }

    // Update database with JSON array of images
    await db.query(
      `UPDATE products
       SET product_name = ?,
           product_description = ?,
           product_images = ?,
           category = ?,
           subcategory = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedDescription,
        JSON.stringify(newImages),
        updatedCategory,
        updatedSubcategory,
        id,
      ]
    );

    // Delete old images from filesystem
    if (oldImagesToDelete.length > 0) {
      oldImagesToDelete.forEach(oldImage => {
        const oldImagePath = path.join(__dirname, "..", oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
            }
          });
        }
      });
    }

    // Fetch updated product
    const [updatedRows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedRows[0],
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(err);
        }
      });
    }

    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the product exists
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = rows[0];

    // Delete product from database
    await db.query("DELETE FROM products WHERE id = ?", [id]);

    // Delete associated image file from filesystem
    const imagePath = path.join(__dirname, "..", product.product_image);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
