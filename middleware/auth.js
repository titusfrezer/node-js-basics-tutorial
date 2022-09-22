const jwt = require("jsonwebtoken");

const checkAuth = function (req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "node-js-secret", (err, decodedToken) => {

        if(err){
            res.redirect('/login');
        }else{
            next();
        }
       
    });
  }else{
    res.redirect('/login');
  }
};


module.exports = checkAuth;