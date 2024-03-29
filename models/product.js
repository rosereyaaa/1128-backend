const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    
    description: {
        type: String,
        required: [true, "Please enter description"],
        maxLength: [100, "Description cannot exceed 100 characters"],
    },
    
    costPrice: {
        type: Number,
        required: [true, "Please enter cost Price"],
        maxLength: [10, "Cost Price cannot exceed 10 characters"],
    },

    sellPrice: {
        type: Number,
        required: [true, "Please enter sell Price"],
        maxLength: [10, "Sell Price cannot exceed 10 characters"],
    },

    stock: {
        type: Number,
        required: false,
        maxLength: [10, "Sell Price cannot exceed 10 characters"],
        default: 0,
    },
    
    images: [{
        index: {
            type: Number,
            required: true,
        },
        
        public_id: {
            type: String,
            required: true,
        },
        
        url: {
            type: String,
            required: true,
        },
    }],
    
    category: {
        type: String,
        required: false,
    },
    
    active: {
        type: Boolean,
        default: false,
        required: true,
    },

});

module.exports = mongoose.model("Products", productSchema);