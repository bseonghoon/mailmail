const router = require('express').Router();
const {read} = require('./controller.mail');

router.get('/', read);

module.exports = router;