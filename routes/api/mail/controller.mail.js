const Imap = require('imap');
const inspect = require('util').inspect;
const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

const imap = new Imap({
    user: 'mailmailread@gmail.com',
    password: 'mail23@#',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});



exports.read = async (req, res) => {
    let mailBox = [];

    const openInbox = cb => {
        imap.openBox('INBOX', true, cb);
    };

    let number = 0;
    await imap.once('ready', function() {
        openInbox(function(err, box) {
            if (err) throw err;
            const f = imap.seq.fetch('1:3', {
                bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                struct: true
            });
            f.on('message', function(msg, seqno) {
                let subject = '';
                msg.on('body', function(stream, info) {
                    let buffer = '';
                    stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        subject =inspect(Imap.parseHeader(buffer).subject);
                    });
                });

                msg.once('attributes', function(attrs) {
                    if(!!!attrs.flags[0]){
                        mailBox.push({no : ++number, subject : subject
                                .replace(/(\r\n\t|\n|\r\t)/gm,"").replace("\\n","").replace(regExp,'').trim()});
                    }
                });
            });
            f.once('error', function(err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function() {
                console.log('Done fetching all messages!');
                imap.end();
            });
        });
    });

    await imap.once('error', function(err) {
        console.log(err);
    });

    await imap.once('end', async function() {
        res.json({
            mailBox
        });
        console.log('Connection ended');
    });

    await imap.connect();
};
