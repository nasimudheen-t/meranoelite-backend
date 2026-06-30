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
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { product_name, product_description, category, subcategory } = req.body;

//     // Get current product
//     const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

//     if (rows.length === 0) {
//       // Clean up uploaded files if product not found
//       if (req.files && req.files.length > 0) {
//         req.files.forEach(file => {
//           try {
//             fs.unlinkSync(file.path);
//           } catch (err) {
//             console.error(err);
//           }
//         });
//       }
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     const currentProduct = rows[0];

//     // Parse existing images (handle both string and array)
//     let existingImages = [];
//     try {
//       if (currentProduct.product_images) {
//         existingImages = typeof currentProduct.product_images === 'string'
//           ? JSON.parse(currentProduct.product_images)
//           : currentProduct.product_images;
//       }
//     } catch (e) {
//       existingImages = [];
//     }

//     // Handle multiple images
//     let oldImagesToDelete = [];
//     let newImages = [];

//     if (req.files && req.files.length > 0) {
//       // Save old images for deletion
//       oldImagesToDelete = [...existingImages];

//       // Create new image paths
//       newImages = req.files.map(file => `uploads/${file.filename}`);

//       // Combine: Keep existing images that weren't replaced + new ones
//       // Note: If you want to replace all images, use only newImages
//       // If you want to add to existing, uncomment the line below
//       // newImages = [...existingImages, ...newImages];
//     } else {
//       // If no new files, keep existing images
//       newImages = existingImages;
//     }

//     // Update fields
//     const updatedName = product_name !== undefined ? product_name : currentProduct.product_name;
//     const updatedDescription = product_description !== undefined
//       ? product_description
//       : currentProduct.product_description;
//     const updatedCategory = category !== undefined ? category : currentProduct.category;
//     const updatedSubcategory = subcategory !== undefined ? subcategory : currentProduct.subcategory;

//     // Validate product name
//     if (!updatedName) {
//       // Clean up uploaded files
//       if (req.files && req.files.length > 0) {
//         req.files.forEach(file => {
//           try {
//             fs.unlinkSync(file.path);
//           } catch (err) {
//             console.error(err);
//           }
//         });
//       }
//       return res.status(400).json({
//         success: false,
//         message: "Product name cannot be empty",
//       });
//     }

//     // Update database with JSON array of images
//     await db.query(
//       `UPDATE products
//        SET product_name = ?,
//            product_description = ?,
//            product_images = ?,
//            category = ?,
//            subcategory = ?
//        WHERE id = ?`,
//       [
//         updatedName,
//         updatedDescription,
//         JSON.stringify(newImages),
//         updatedCategory,
//         updatedSubcategory,
//         id,
//       ]
//     );

//     // Delete old images from filesystem
//     if (oldImagesToDelete.length > 0) {
//       oldImagesToDelete.forEach(oldImage => {
//         const oldImagePath = path.join(__dirname, "..", oldImage);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlink(oldImagePath, (err) => {
//             if (err) {
//               console.error("Error deleting old image:", err);
//             }
//           });
//         }
//       });
//     }

//     // Fetch updated product
//     const [updatedRows] = await db.query(
//       "SELECT * FROM products WHERE id = ?",
//       [id]
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: updatedRows[0],
//     });
//   } catch (error) {
//     // Clean up uploaded files on error
//     if (req.files && req.files.length > 0) {
//       req.files.forEach(file => {
//         try {
//           fs.unlinkSync(file.path);
//         } catch (err) {
//           console.error(err);
//         }
//       });
//     }

//     console.error("Update product error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_description, category, subcategory } =
      req.body;

    // Get current product
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const currentProduct = rows[0];
    console.log("Raw DB value:", currentProduct.product_images);
           console.log(typeof currentProduct.product_images);

    // Parse existing images
    let existingImages = [];

    try {
      if (Array.isArray(currentProduct.product_images)) {
        // Already an array
        existingImages = currentProduct.product_images;
      } else if (typeof currentProduct.product_images === "string") {
        // Stored as JSON string
        existingImages = JSON.parse(currentProduct.product_images);
      } else {
        existingImages = [];
      }
    } catch (err) {
      console.error("Image parse error:", err);
      existingImages = [];
    }

    console.log("Existing Images:", existingImages);

    console.log("Existing Images:", existingImages);
    console.log("Existing Images:", existingImages);
    // If new images uploaded, replace old images
    // Otherwise keep existing images
    let updatedImages = [...existingImages];
    console.log("Updated Images:", updatedImages);
    const replaceIndexes = Array.isArray(req.body.replaceIndexes)
      ? req.body.replaceIndexes
      : req.body.replaceIndexes
        ? [req.body.replaceIndexes]
        : [];

    // Replace only selected images
   
    if (req.files && req.files.length > 0) {
      const replaceIndexes = Array.isArray(req.body.replaceIndexes)
        ? req.body.replaceIndexes
        : req.body.replaceIndexes
          ? [req.body.replaceIndexes]
          : [];

      req.files.forEach((file, i) => {
        const index = Number(replaceIndexes[i]);

        if (!isNaN(index)) {
          updatedImages[index] = file.path;
        }
      });
    }
    const updatedName = product_name ?? currentProduct.product_name;

    const updatedDescription =
      product_description ?? currentProduct.product_description;

    const updatedCategory = category ?? currentProduct.category;

    const updatedSubcategory = subcategory ?? currentProduct.subcategory;
    

    await db.query(
      `UPDATE products
       SET
         product_name = ?,
         product_description = ?,
         product_images = ?,
         category = ?,
         subcategory = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedDescription,
        JSON.stringify(updatedImages),
        updatedCategory,
        updatedSubcategory,
        id,
      ],
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("========== UPDATE ERROR ==========");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//   try {
//     const { id } = req.params;

//     // Get current product
//     const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

//     if (rows.length === 0) {
//       if (req.files && req.files.length > 0) {
//         req.files.forEach((file) => {
//           try {
//             fs.unlinkSync(file.path);
//           } catch (err) {
//             console.error(err);
//           }
//         });
//       }
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     const currentProduct = rows[0];

//     // Parse existing images
//     let existingImages = [];
//     try {
//       if (currentProduct.product_images) {
//         existingImages =
//           typeof currentProduct.product_images === "string"
//             ? JSON.parse(currentProduct.product_images)
//             : currentProduct.product_images;
//       }
//     } catch (e) {
//       existingImages = [];
//     }

//     // Handle different content types
//     let updatedName, updatedDescription, updatedCategory, updatedSubcategory;
//     let finalImages = existingImages;
//     let oldImagesToDelete = [];

//     // Check if request has files (multipart/form-data)
//     if (req.files && req.files.length > 0) {
//       // Handle FormData with images
//       const { product_name, product_description, category, subcategory } =
//         req.body;

//       updatedName = product_name || currentProduct.product_name;
//       updatedDescription =
//         product_description || currentProduct.product_description;
//       updatedCategory = category || currentProduct.category;
//       updatedSubcategory = subcategory || currentProduct.subcategory;

//       // Replace all images with new ones
//       oldImagesToDelete = [...existingImages];
//       finalImages = req.files.map((file) => `uploads/${file.filename}`);

//       // If you want to keep existing images and add new ones, use this:
//       // finalImages = [...existingImages, ...req.files.map(file => `uploads/${file.filename}`)];

//       // If you want to replace specific indices, use the advanced version below
//     } else {
//       // Handle JSON request (text-only update)
//       const { product_name, product_description, category, subcategory } =
//         req.body;

//       updatedName =
//         product_name !== undefined ? product_name : currentProduct.product_name;
//       updatedDescription =
//         product_description !== undefined
//           ? product_description
//           : currentProduct.product_description;
//       updatedCategory =
//         category !== undefined ? category : currentProduct.category;
//       updatedSubcategory =
//         subcategory !== undefined ? subcategory : currentProduct.subcategory;

//       // Keep existing images
//       finalImages = existingImages;
//     }

//     // Validate product name
//     if (!updatedName) {
//       if (req.files && req.files.length > 0) {
//         req.files.forEach((file) => {
//           try {
//             fs.unlinkSync(file.path);
//           } catch (err) {
//             console.error(err);
//           }
//         });
//       }
//       return res.status(400).json({
//         success: false,
//         message: "Product name cannot be empty",
//       });
//     }

//     // Update database
//     await db.query(
//       `UPDATE products
//        SET product_name = ?,
//            product_description = ?,
//            product_images = ?,
//            category = ?,
//            subcategory = ?
//        WHERE id = ?`,
//       [
//         updatedName,
//         updatedDescription,
//         JSON.stringify(finalImages),
//         updatedCategory,
//         updatedSubcategory,
//         id,
//       ],
//     );

//     // Delete old images if new ones were uploaded
//     if (oldImagesToDelete.length > 0) {
//       oldImagesToDelete.forEach((oldImage) => {
//         if (oldImage) {
//           const oldImagePath = path.join(__dirname, "..", oldImage);
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlink(oldImagePath, (err) => {
//               if (err) console.error("Error deleting old image:", err);
//             });
//           }
//         }
//       });
//     }

//     // Fetch updated product
//     const [updatedRows] = await db.query(
//       "SELECT * FROM products WHERE id = ?",
//       [id],
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: updatedRows[0],
//     });
//   } catch (error) {
//     // Clean up uploaded files on error
//     if (req.files && req.files.length > 0) {
//       req.files.forEach((file) => {
//         try {
//           fs.unlinkSync(file.path);
//         } catch (err) {
//           console.error(err);
//         }
//       });
//     }

//     console.error("Update product error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

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
