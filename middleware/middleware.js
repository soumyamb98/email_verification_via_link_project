const jwt = require('jsonwebtoken');
const signupdata = require('../model/signupmodel');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'my secret jwt secret key', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/');
  }
};
// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'my secret jwt secret key', async (err, decodedToken) => {
      if (err) {
        res.locals.log = null;
        next();
      } else {
        let user = await signupdata.findById(decodedToken.id);
        res.locals.log = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };