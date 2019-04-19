const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = require('./users.model');

function extract_user_payload_from_user_obj_update (user_obj) {
  const newItem = {
    'userID': user_obj.userID,
    'userName':user_obj.userName,
    'userDesc':user_obj.userDesc
  };
  return newItem
}

/* API updates one user */
function update_user_info (req, res, next) {
  // gather attributes from request
  const user = req.body.user;
  const newItem = extract_user_payload_from_user_obj_update(user);

  jwt.verify(
    user.token,
    'secret',
    function(err, decoded) {
      if (err) {
        const result_json = {
          status: 'failed',
          message: 'Failed to authenticate token.'
        };
        console.log("failed authenticate token");
        res.json(result_json);
      } else {
        req.decoded = decoded;
        console.log("path to call update user", newItem);
        users.findOneAndUpdate(
        {userID: newItem.userID},
        { $set:
          {
            userName: newItem.userName,
            userDesc: newItem.userDesc
          }
        },
        {upsert: true, new: true, runValidators: true},
        function (err, doc) {
          if (err) {
            const result_json = {
              status: 'failed',
              message: err.message
            };
            console.log("failed to find user");
            res.json(result_json);
          } else {
            const user = {
              userName: doc.userName,
              userDesc: doc.userDesc
            }
            const result_json = {
              status: 'success',
              data: user
            };
            console.log("found a user");
            res.json(result_json);
          }
        }
      );
    }
  });
}

function extract_user_payload_from_user_obj_register (user_obj) {
  const newItem = {
    userID: user_obj.userID,
    userName: user_obj.userName,
    userPassword: bcrypt.hashSync(user_obj.userPassword, 8)
  };
  return newItem;
}

/* API sets one new user clothing */
function register_new_user(req, res, next) {
  // gather attributes from request
  const user = req.body.user;
  const newItem = extract_user_payload_from_user_obj_register(user);

  users.find(
    {userID: user.userID},
    function (err, doc) {
      if (err) {
        const result_json = {
          status: 'failed',
          message: error
        };
        res.json(result_json);
      } else {
        if (doc.length != 0) {
          const result_json = {
            status: 'failed',
            message: 'user already exists.'
          };
          res.json(result_json);
        } else {
          createNewUser();
        }
      }
    }
  );

  function createNewUser () {
    // new user path
    newItem['_id'] = mongoose.Types.ObjectId();
    // create new clothing from clothes schema
    users.findOneAndUpdate(
      {_id: newItem._id},
      newItem,
      {upsert: true, new: true, runValidators: true},
      function (err, doc) {
        if (err) {
          const result_json = {
            status: 'failed',
            message: err.message
          };
          res.json(result_json);
        } else {
          const token = jwt.sign({id: doc._id}, 'secret', {
            expiresIn: 86400
          });
          const user = {
            userID: doc.userID,
            userName: doc.userName,
            id: doc._id,
            token: token
          }
          const result_json = {
            data: user,
            status: 'success',
            auth: true,
            token: token
          };
          console.log(result_json);
          res.json(result_json);
        }
      }
    );
  }

}

/* API returns true if passed user and password
matches a pair in the database. */
function check_login_credentials(req, res, next) {
  var user = req.body.user;
  // query all clothes in the database
  users.find(
    {userID: user.userID},
    function (err, doc) {
      if (err) {
        const result_json = {
          status: 500,
          message: err.message
        };
        res.json(result_json);
      } else {
        var result = false;
        if (doc != {}) {
          doc.forEach(function(dbUser) {
            if (dbUser.userID == user.userID) {
              var passwordValidate = bcrypt.compareSync(user.userPassword, dbUser.userPassword);
              result = passwordValidate;
            }
          });
        }
        if (result) { // successful login
          const token = jwt.sign({id: doc._id}, 'secret', {
            expiresIn: 86400
          });
          const user = {
            userID: doc[0].userID,
            userName: doc[0].userName,
            userDesc: doc[0].userDesc,
            id: doc[0]._id,
            token: token
          }
          const result_json = {
            data: user,
            status: 200,
            auth: true,
            token: token
          };
          res.json(result_json);
        } else {
          const result_json = {
            status: 401,
            auth: false,
            token: null
          }
          res.json(result_json);
        }
      }
    }
  );
}

var users_module = {
  update_user_info: update_user_info,
  register_new_user: register_new_user,
  check_login_credentials: check_login_credentials
}

module.exports = users_module;
