const Product = require("../models/product");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const jwt = require('jsonwebtoken');
const PAGE_SIZE = 8;

exports.newProduct = async (req, res, next) => {
    const { name, description, costPrice, sellPrice, stock, category, active, } = req.body;
    
    try {
        const imagePaths = [];
        if (!req.files.firstImage) {
            return res.status(400).json({
                success: false,
                message: 'Please provide image at the leftmost',
            });
        }
        
        if (req.files.firstImage) {
            const firstImage = req.files.firstImage[0];
            const firstImageResult = await cloudinary.v2.uploader.upload(firstImage.path, {
            folder: 'products',
        });
        imagePaths.push({
            index: 0,
            public_id: firstImageResult.public_id,
            url: firstImageResult.secure_url,
        });
    }
    if (req.files.secondImage) {
        const secondImage = req.files.secondImage[0];
        const secondImageResult = await cloudinary.v2.uploader.upload(secondImage.path, {
            folder: 'products',
        });
        imagePaths.push({
            index: 1,
            public_id: secondImageResult.public_id,
            url: secondImageResult.secure_url,
        });
    }
    if (req.files.thirdImage) {
        const thirdImage = req.files.thirdImage[0];
        const thirdImageResult = await cloudinary.v2.uploader.upload(thirdImage.path, {
            folder: 'products',
        });
        imagePaths.push({
            index: 2,
            public_id: thirdImageResult.public_id,
            url: thirdImageResult.secure_url,
        });
    }

    const product = await Product.create({
        name,
        description,
        costPrice,
        sellPrice,
        stock,
        category,
        active,
        images: imagePaths,
    });
    res.status(201).json({
        success: true,
        product,
    });
} catch (error) {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'An error occurred while creating the Product.',
    });
    }
};

exports.getProductDetails = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(
            new ErrorHandler(`Product not found with id: ${req.params.id}`)
        );
    }
    
    res.status(200).json({
        success: true,
        product,
    });
};

exports.updateProduct = async (req, res, next) => {
    const { name, description, costPrice, sellPrice, stock, category, active,} = req.body;
    try {
        const existingProduct = await Product.findById(req.params.id);
        const imagePaths = [...existingProduct.images];
        
        const deleteImage = async (public_id) => {
            if (public_id) {
                await cloudinary.v2.uploader.destroy(public_id);
            }
        };
        
        if (req.files.firstImage) {
            const firstImage = req.files.firstImage[0];
            const firstImageResult = await cloudinary.v2.uploader.upload(firstImage.path, {
                folder: 'products',
            });
            await deleteImage(imagePaths[0]?.public_id);
            imagePaths[0] = {
                index: 0,
                public_id: firstImageResult.public_id,
                url: firstImageResult.secure_url,
            };
        }
        
        if (req.files.secondImage) {
            const secondImage = req.files.secondImage[0];
            const secondImageResult = await cloudinary.v2.uploader.upload(secondImage.path, {
                folder: 'products',
            });
            
            await deleteImage(imagePaths[1]?.public_id);
            imagePaths[1] = {
                index: 1,
                public_id: secondImageResult.public_id,
                url: secondImageResult.secure_url,
            };
        }
        
        if (req.files.thirdImage) {
            const thirdImage = req.files.thirdImage[0];
            const thirdImageResult = await cloudinary.v2.uploader.upload(thirdImage.path, {
                folder: 'products',
            });
            await deleteImage(imagePaths[2]?.public_id);
            imagePaths[2] = {
                index: 2,
                public_id: thirdImageResult.public_id,
                url: thirdImageResult.secure_url,
            };
        }
        
        const newProductData = {
            name,
            description,
            costPrice,
            sellPrice,
            stock,
            category,
            active,
            images: imagePaths,
        };
        
        const product = await Product.findByIdAndUpdate(req.params.id, newProductData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }
        
        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the Product.',
        });
    }
};

exports.updateProductStatus = async (req, res, next) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { active: !oldProduct.active } },
            { new: true, runValidators: true, useFindAndModify: false }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }
        
        res.status(200).json({
            success: true,
            oldProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the Product.',
        });
    }
};

exports.updateStocks = async (req, res, next) => {
    try {
        const updates = req.body.updatedStocks;
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No Changes',
            });
        }

        const updatePromises = updates.map(async ({ _id, stock }) => {
            const oldProduct = await Product.findById(_id);
            
            if (!oldProduct) {
                return {
                    success: false,
                    message: `Product with ID ${_id} not found.`,
                };
            }
            
            const updatedProduct = await Product.findByIdAndUpdate(_id,
                { $set: { stock: stock } },
                { new: true, runValidators: true, useFindAndModify: false }
            );
            
            return {
                success: true,
                oldProduct,
                updatedProduct,
            };
        });
        
        const updateResults = await Promise.all(updatePromises);
        res.status(200).json({
            success: true,
            updateResults,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the stocks.',
        });
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler(`Product not found with id: ${req.params.id}`));
        }
        
        const imageIds = product.images.map((image) => image.public_id);
        for (const imageId of imageIds) {
            if (imageId) {
                await cloudinary.v2.uploader.destroy(imageId);
            }
        }
        
        // Delete the product from the database
        await product.deleteOne();

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the product.',
        });
    }
};

exports.allProducts = async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products,
    });
};

exports.allProduct = async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products,
    });
};

exports.allProductWeb = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        // let isMuslim = false;
        
        if (req.query.searchQuery && /[^a-zA-Z0-9]/.test(req.query.searchQuery)) {
            return;
        }
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
            // if (req.user.religion.toLowerCase() === "muslim") {
            //     isMuslim = true;
            // }
        }
        
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * PAGE_SIZE;
        let query = { active: true };
        
        if (req.query.category) {
            query.category = req.query.category; 
        }
        
        if (req.query.store) {
            query['store.name'] = req.query.store; // Adding the store filter
        }
        
        if (req.query.searchQuery) {
            const searchRegex = new RegExp(req.query.searchQuery, 'i');
            const searchFields = ['name', 'store.name'];
            const searchFilters = searchFields.map(field => ({
                [field]: { $regex: searchRegex }
        }));
            query = {
                $and: [
                    query,{
                        $or: searchFilters
                    }
                ]
            };
        }

        // if (isMuslim) {
        //     query.halal = { $ne: false };
        // }
        
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
        const allProducts = await Product.find(query)
        .skip(startIndex)
        .limit(PAGE_SIZE);
        
        const hasMore = page < totalPages;
        
        res.status(200).json({
            success: true,
            totalProducts,
            products: allProducts,
            currentPage: page,
            totalPages,
            hasMore
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};