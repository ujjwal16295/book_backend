const jwt = require('jsonwebtoken');
const SECRET_KEY = "daddybitch";  // Store this securely!
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email,username:user.name }, SECRET_KEY, {
        expiresIn: '1h'
    });
};
const verifyToken = async (token) => {
    // Wrap jwt.verify in a Promise
    return new Promise((resolve, reject) => {
      jwt.verify(token, SECRET_KEY, (err, authData) => {
        if (err) {
          reject({ error: true, errorDesc: err });
        } else {
          resolve({ error: false, data: authData });
        }
      });
    });
  };
module.exports = { generateToken, verifyToken };