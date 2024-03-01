const upload = require("../utils/multer");
const express = require("express");
const router = express.Router();

const {
    isAuthenticatedUser,
    authorizeRoles,
} = require("../middlewares/auth");

const {
    newProduct,
    getProductDetails,
    updateProduct,
    updateProductStatus,
    updateStocks,
    deleteProduct,
    allProducts,
    allProduct,
    allProductWeb
} = require("../controllers/ProductController");

router.post("/product/new", isAuthenticatedUser,authorizeRoles('Admin', 'Employee', 'Owner'), upload.fields([
    { name: 'firstImage', maxCount: 1 }, 
    { name: 'secondImage', maxCount: 1 }, 
    { name: 'thirdImage', maxCount: 1 },  
]), newProduct);

router.route('/product/:id')
.get(isAuthenticatedUser,authorizeRoles('Owner', 'Employee','Admin'),getProductDetails)
.put(upload.fields([
    { name: 'firstImage', maxCount: 1 }, 
    { name: 'secondImage', maxCount: 1 }, 
    { name: 'thirdImage', maxCount: 1 },  
]), updateProduct)
.delete(isAuthenticatedUser,authorizeRoles('Owner', 'Employee', 'Admin'),deleteProduct)
router.route('/product/status/:id').put(updateProductStatus);
router.route('/product/update-stocks').patch(updateStocks);
router.get("/product",isAuthenticatedUser,authorizeRoles('Owner', 'Employee', 'Admin'),allProducts);
// 
router.get("/allProduct",allProduct);
router.get("/allProductWeb",allProductWeb);

module.exports = router;