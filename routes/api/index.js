const router = require('express').Router();
const mail = require('./mail/index');

router.use('/mail', mail);

module.exports = router;