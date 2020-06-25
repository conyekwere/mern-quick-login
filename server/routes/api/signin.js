const User = require("../../models/user.model");
const UserSession = require("../../models/usersession.model");

module.exports = app => {
  /*
   * Sign up
   */

  app.post("/api/account/signup", (req, res, next) => {
    const { body } = req;

    const { firstName, lastName, password } = body;
    let { email } = body;

    //  when getting singup data put data in body  with these itmes
    //  const {firtName ...} object items are part of body
    // if null present error state

    if (!firstName) {
      return res.send({
        success: false,
        mes: "Error: First name cannot be blank"
      });
    }
    if (!lastName) {
      return res.send({
        success: false,
        mes: "Error: Last name cannot be blank"
      });
    }
    if (!email) {
      return res.send({
        success: false,
        mes: "Error: Email cannot be blank"
      });
    }
    if (!password) {
      return res.send({
        success: false,
        mes: "Error: Password cannot be blank"
      });
    }

    email = email.toLowerCase();

    // Steps for  sign up
    // 1) Verify email doesn't exist
    // 2) Save

    User.find(
      {
        email: email
      },
      (err, previousUsers) => {
        /* 
        User.find() = look for all the users from the mongoatlas database 
        When finding data input  email data model as a paramiter
        after thatreturn error and variable  previousUsers
         */

        if (err) {
          return res.send({
            success: false,
            mes: "Error: Server error"
          });
        } else if (previousUsers.length > 0) {
          return res.send({
            success: false,
            mes: "Error: Account already exist"
          });
        }

        //Save the new user
        const userSession = new User();
        userSession.email = email;
        userSession.firstName = firstName;
        userSession.lastName = lastName;
        userSession.password = userSession.generateHash(password);
        userSession.save((err, user) => {
          if (err) {
            return res.send({
              success: false,
              mes: "Error: Server error"
            });
          }
          return res.send({
            success: true,
            mes: "Signed Up"
          });
        });
      }
    );
  });

  /*
   * Sign in 
    you need to get the password and the email to login. Also return an error state for when input is blank 

   */

  app.post("/api/account/signin", (req, res, next) => {
    const { body } = req;

    const { password } = body;
    let { email } = body;

    if (!email) {
      return res.send({
        success: false,
        mes: "Error: Email cannot be blank"
      });
    }
    if (!password) {
      return res.send({
        success: false,
        mes: "Error: Password cannot be blank"
      });
    }

    User.find(
      {
        email: email
      },
      (err, users) => {
        // When inputing users if null or undefined return Error: Server error'

        if (err) {
          return res.send({
            success: false,
            mes: "Error: Server error"
          });

          // When inputing more than one user return invalid '
        }
        if (users.length != 1) {
          return res.send({
            success: false,
            mes: "Error: Invalid"
          });
        }

        const user = users[0];
        // if user enter the wrong password then
        if (!user.validPassword(password)) {
          return res.send({
            success: false,
            mes: "Error: Invalid"
          });
        }

        //Save the user login
        const userSession = new UserSession();
        userSession.userId = user._id;
        userSession.save((err, doc) => {
          if (err) {
            return res.send({
              success: false,
              mes: "Error: Server error"
            });
          }

          //if all input is valid return mes and user token which is a default object item in json
          return res.send({
            success: true,
            mes: "Valid sign in",
            token: doc._id
          });
        });
      }
    );

    email = email.toLowerCase();
  });

  app.get("/api/account/verify", (req, res, next) => {
      
    const { query } = req;

    const { token } = query;
    //  query  means you enter field  into api call

    // Get the token
    // Verify that the token is  one of a kind
    // That it is not deleted

    if (!token) {
      return res.send({
        success: false,
        mes: "Error: Email cannot be blank"
      });
    }

    UserSession.find(
      {
        _id: token,
        isDeleted: false
      },
      // _id: token = /api/account/verify?token={_id}
      (err, sessions) => {
        if (err) {
          return res.send({
            success: false,
            mes: "Error: Server error"
          });

          // When inputing more than one session or incorrect return invalid '
        }
        if (sessions.length != 1) {
          return res.send({
            success: false,
            mes: "Error: Invalid"
          });
        } else {
          return res.send({
            success: true,
            mes: "Good",
          });
        }
      }
    );
    
  });

  app.post("/api/account/logout", (req, res, next) => {
    const { query } = req;

    const { token } = query;

    // Get the token
    // Verify that the token is  one of a kind
    // That it is not deleted

    if (!token) {
      return res.send({
        success: false,
        mes: "Error: Email cannot be blank"
      });
    }

    UserSession.findOneAndUpdate(
      {
        _id: token,
        isDeleted: false
      },{
        $set: {isDeleted: true}
      },null,
      (err, sessions) => {
        if (err) {
          return res.send({
            success: false,
            mes: "Error: Server error"
          });

          // When inputing more than one session or incorrect return invalid '
        }
        return res.send({
          success: true,
          mes: "Good"
        });
      }
    );
    
  });
};
