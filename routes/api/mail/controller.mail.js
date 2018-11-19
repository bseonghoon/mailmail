const Imap = require('imap');
const inspect = require('util').inspect;
const mergeJSON = require('merge-json');
const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

const imap = new Imap({
    user: 'mailmailread@gmail.com',
    password: 'mail23@#',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

exports.read = async (req, res) => {
    let results = {};
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
                    number++;
                    if(!!!attrs.flags[0]){
                        subject = subject
                            .replace(/(\r\n\t|\n|\r\t)/gm,"").replace("\\n","").replace(regExp,'').trim()

                        results['key' + number] = subject;
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
        console.log(results);
        let answer = {
            "version": "2.0",
            "resultCode": "OK",
            output :results
        };
        res.json(answer);
        console.log('Connection ended');
    });

    await imap.connect();
};
