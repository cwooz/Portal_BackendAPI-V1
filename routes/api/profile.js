const express = require('express');
const router = express.Router();


// @route     GET api/profile/test
// @desc      Tests post route
// @access    Public
router.get('/test', (req, res) => res.JSON({ msg: 'Profile Works' }));

module.exports = router;