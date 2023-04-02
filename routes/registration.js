var express = require('express');
var router = express.Router();
const userhelper = require('../helpers/storehelpers');
const { response } = require('../app');
const usercontroller=require('../controllers/usercontrollers')


/* GET users listing. */
router.use((req, res, next) => {
  if (req.session.user) {
    return res.redirect('/')
  }
  next()
})

router.get('/',usercontroller.register);
router.post('/',usercontroller.registerpost)

module.exports = router;
