const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Check if email exists
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (user) {
            res.json({ exists: true, name: user.name });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Reset password request:', email); // Debug log
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        console.log('Password reset successful for:', email); // Debug log
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;