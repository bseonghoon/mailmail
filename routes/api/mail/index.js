const router = require('express').Router();
const {read} = require('./controller.mail');

router.post('/nowMail', read);

module.exports = router;