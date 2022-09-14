module.exports = {
  errCode1: function (res, err){
    return res.status(404).json({code: 1, message: err.message})
  },

  errCode2: function (res, err){
    return res.status(400).json({code: 2, message: err})
  },

  successCode: function (res, message){
    return res.json({code: 0, message: message})
  },

  dataCode: function(res, data){
    return res.json({code: 0, message: "Successfully !!!", data: data})
  }
}
