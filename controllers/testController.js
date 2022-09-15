const Test = require('../models/test')

const methods = require('../function')

class testController{
 //  [POST] /test/addTrans
  addTrans(req, res){
    console.log(req.body)
    const newTran = Test(req.body)
    newTran.save()
    .then(tran => {
      if(tran){
        methods.successCode(res, "Successfully !! Add a new tran")
      }else{
        methods.errCode2(res, "Failed !! Can not add a new tran")
      }
    })
    .catch(err => {
      methods.errCode1(res, err)
    })
  }
} 

module.exports = new testController
