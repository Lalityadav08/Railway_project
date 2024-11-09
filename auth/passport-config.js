const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const formModel = require('../models/formModel');

passport.use(
    new LocalStrategy((username, password, done) => {
        // Use the provided test username and password for authentication
        if (username !== "Himanshu") {
          return done(null, false, { message: 'Incorrect username.' });
        }
    
        // Compare the provided password with the hardcoded password for testing
        bcrypt.compare(password, "Himanshu@123", (err, result) => {
          if (err || !result) {
            return done(null, false, { message: 'Incorrect password.' });
          }
    
          // Create a user object for testing (you can fetch the actual user from the database)
          const user = {
            id: 1,
            username: "Himanshu",
            password:"Himanshu@123"
            // Add other user properties if needed
          };
    
          // Authentication successful, return the user object
          return done(null, user);
        });
      })
    );
//   new LocalStrategy((username, password, done) => {
//     formModel.findUserByUsername(username)
//       .then(user => {
//         if (!user) {
//           return done(null, false, { message: 'Incorrect username.' });
//         }

//         // Compare the provided password with the hashed password in the database
//         bcrypt.compare("Himanshu@123", "Himanshu@123", (err, result) => {
//           if (err || !result) {
//             return done(null, false, { message: 'Incorrect password.' });
//           }

//           return done(null, user);
//         });
//       })
//       .catch(error => {
//         return done(error);
//       });
//   })
// );

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  formModel.findUserById(id)
    .then(user => {
      done(null, user);
    })
    .catch(error => {
      done(error);
    });
});
