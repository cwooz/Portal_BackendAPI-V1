const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User Model
const user = require('../../models/User');



// Routes - Start ----------------------------------------------->

// @Route     GET api/users/test ---------------------------->
// @Desc      Tests post route
// @Access    Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @Route     GET api/users/register
// @Desc      Register user
// @Access    Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
      errors.email = 'Email Already Exists';
			// return res.status(400).json({ email: 'Email Already Exists' });
		} else {
			const avatar = gravatar.url(req.body.email, {
				s: '200', // Size
				r: 'pg', // Rating
				d: 'mm' // Default
			});

			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				avatar: avatar,
				password: req.body.password
			});

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err;
					newUser.password = hash;
					newUser
						.save()
						.then(user => res.json(user))
						.catch(err => console.log(err));
				});
			});
		}
	});
});


// @Route     GET api/users/login ----------------------->
// @Desc      Login User / Returning JWT Token
// @Access    Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

	const email = req.body.email;
	const password = req.body.password;

	// Find user by email
	User.findOne({ email }).then(user => {
		// Check for user
		if (!user) {
      errors.email = 'User not found';
			// return res.status(404).json({ email: 'User not found' });
		}

		// Check password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				// User Matched
				const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload

				// Sign the Token
				jwt.sign(
					payload,
					keys.secretOrKey,
					{ expiresIn: 86400 },
					(err, token) => {
						res.json({
							success: true,
							token: 'Bearer' + token
						});
					}
				);
			} else {
        errors.password = 'Password incorrect';
				return res.status(400).json(errors);
			}
		});
	});
});


// @Route     GET api/users/current -------------------->
// @Desc      Return current user
// @Access    Private
router.get('/current', passport.authenticate('jwt', { session: false }),
	(req, res) => {
    // res.json(req.user);
    
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
	}
);

// --------------------------------------------------------->


module.exports = router;
