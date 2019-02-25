const express = require('express');
const router = express.Router();


// @route     GET api/profile/test
// @desc      Tests post route
// @access    Public
router.get('/test', (req, res) => res.json({ msg: 'Profile Works' }));

// router.get('/test', (req, res) => res.status(404).end());
// router.get('/test', (req, res) => {
//   res.send({ hello: 'world' })
// });


module.exports = router;