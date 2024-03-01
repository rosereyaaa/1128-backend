const upload = require("../utils/multer");
const express = require("express");
const router = express.Router();

const {
    isAuthenticatedUser,
    authorizeRoles,
} = require("../middlewares/auth");

const {
    newUser,
    registerUser,
    loginUser,
    logout,
    getUserDetails,
    allUsers,
    updateUser,
    updateProfile,
    deleteUser
} = require("../controllers/UserController");

//Admin & Employees
router.post("/employee/new",  isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), upload.single("avatar"), newUser);
router.route('/employee/:id')
    .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), getUserDetails)
    .put(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), upload.single("avatar"), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), deleteUser);
router
    .route("/employee/users")
    .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), allUsers);

//Default
router.route('/edit-profile/:id')
    .put(upload.single("avatar"), updateProfile);

//Login, Logout, Register
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);

module.exports = router;