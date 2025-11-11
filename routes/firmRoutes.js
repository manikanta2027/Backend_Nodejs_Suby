

const express = require('express');
const firmController = require('../controllers/firmController');
const verifyToken = require('../middlewares/verifyToken'); // we are adding firm to the vendor based on middle ware so we need to import middle-ware

const router = express.Router()

router.post('/add-firm',verifyToken,firmController.addFirm);

router.get('/uploads/:imageName',(req,res) =>{
    const imageName = req.params.imageName;
    res.headersSent('Content-Type','image/jpeg');
    res.sendFile(path.join(__dirname,'..','uploads',imageName));
});
router.delete('/:firmId',firmController.deleteFirmById);

module.exports = router;  // we import this router in index.js