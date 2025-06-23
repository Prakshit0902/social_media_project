const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        console.log('Full error object:', error); // Add this
        console.log('Error code:', error.code);   // Add this
        console.log('Error keyPattern:', error.keyPattern); // Add this
        console.log('Error keyValue:', error.keyValue);     // Add this
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            const value = error.keyValue ? error.keyValue[field] : 'unknown';
            return res.status(400).json({
                success: false,
                message: `${field} '${value}' already exists`
            })
        }
        
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }
}

export {asyncHandler}