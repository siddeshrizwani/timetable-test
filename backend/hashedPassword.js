const bcrypt = require("bcrypt");
const password = "tanay123"; // The password you want to use
bcrypt.hash(password, 10, function (err, hash) {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Your hashed password is:");
  console.log(hash);
});

// const bcrypt = require("bcrypt");

// const inputPassword = "tanay123";
// const storedHash =
//   "$2b$10$.NzB9LjHlZac.I.PcK/xAOABsA8JWhYyWKmVq4rKET2WWA3Vy3rcu";

// bcrypt.compare(inputPassword, storedHash, (err, result) => {
//   if (result) {
//     console.log("✅ Password matched!");
//   } else {
//     console.log("❌ Invalid password.");
//   }
// });

