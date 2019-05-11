const express = require('express')
const next = require('next')
const { createEventAdapter } = require('@slack/events-api');
const { handleReactionEvent, getReactionList, getMessages, updateEmoji } = require('./utils/api')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000;
const app = next({ dev, dir: 'src' })
const handle = app.getRequestHandler()

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
slackEvents.on('reaction_added', event => {
    handleReactionEvent(event);
});

slackEvents.on('error', e => {
    console.log('slackEvents error')
    console.log(e);
});

const errorHandler = (err, req, res, next) => {
    console.log(req);
    console.log(err);
    res.status(500).send('Error!');
}

app.prepare()
    .then(() => {
        const server = express()

        server.use("/slack/events", slackEvents.expressMiddleware())

        server.get('/api/update_emoji', (_req, res) => {
            updateEmoji();
            res.json({ ok: true });
        });

        server.get('/api/reactions', (_req, res) => {
            getReactionList().then(reactions => {
                res.json(reactions);
            })
        });

        server.get('/api/reactions/:id', (req, res) => {
            if (!req.params.id) {
                getReactionList().then(reactions => {
                    res.json(reactions);
                })
            } else {

                getMessages(req.params.id).then(messages => {
                    res.json(messages);
                });
            }
        });

        server.get('/api/*', (req, res) => {
            return res.status(404).json({ ok: false, message: 'Unknown API path' });
        })

        server.get('*', (req, res) => {
            return handle(req, res)
        });

        server.use(errorHandler);

        server.listen(port, (err) => {
            if (err) throw err;
            console.log(`> Ready on port ${port}`)
        });
    })
    .catch(err => {
        console.error(err.stack);
    })