const bcrypt = require('bcrypt');

const password = "test@123";

// Generate a salt to use during hashing (10 rounds is a common value)
bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }

  // Hash the password with the generated salt
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }

    // Log the hashed password
    console.log('Hashed Password:', hash);
  });
});
