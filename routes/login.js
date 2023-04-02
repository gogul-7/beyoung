var express = require('express');
const { response } = require('../app');
var router = express.Router();
const usercontroller=require('../controllers/usercontrollers')





/* GET users listing. */
router.use((req, res, next) => {
  if (req.session.user) {
    return res.redirect('/')
  }
  next()
})


router.get('/',usercontroller.login);

router.post('/',usercontroller.loginpost);

router.get('/otplogin',usercontroller.otplogin);

router.post('/otplogin',usercontroller.otploginpost);

router.get('/otplogin/verification',usercontroller.otpverification);

router.post('/otplogin/verification',usercontroller.otpverificationpost);

module.exports = router;




