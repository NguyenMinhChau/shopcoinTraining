const expres = require('express')
const router = expres.Router()
const CoinsController = require('../controllers/CoinsController')
const multer = require('multer')
const Path = require('path')

// setting upload
const pathSave = Path.join(__dirname,'../uploads')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pathSave)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })

// import validator



// [GET] /add
router.post('/add', upload.single('avatar'), CoinsController.addCoin)

module.exports = router