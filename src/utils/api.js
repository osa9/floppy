const Firestore = require('@google-cloud/firestore');
const emoji = require('node-emoji');
const { WebClient } = require('@slack/web-api');

const SLACK_TOKEN = process.env.SLACK_TOKEN
const webClient = new WebClient(SLACK_TOKEN);

/**
 * Responds to Slack HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handleReactionEvent = async (event) => {
    try {
        console.log(event.reaction);
        const message = await getMessage(event);
        console.log(`Successfully get message: [${event.reaction}] ${message.username} ${message.text}`)
        saveToFirestore(event.reaction, message);
        console.log("done");
    } catch (err) {
        console.error(err);
    }
}


const saveToFirestore = async (reaction, message) => {
    const firestore = new Firestore();

    const reactionEmoji = emoji.hasEmoji(reaction) ? emoji.get(reaction) : reaction;
    const reactionDoc = firestore.collection('floppy').doc(reactionEmoji);
    const messageDoc = reactionDoc.collection('posts').doc(message.ts);

    // custom emoji
    if (!emoji.hasEmoji(reaction)) {
        exports.updateEmoji(reaction);
    }

    const storeMessage = {
        ...message,
        ts: Firestore.Timestamp.fromMillis(parseInt(parseFloat(message.ts) * 1000))
    }

    await Promise.all([
        reactionDoc.set({
            'name': reaction,
            'count': Firestore.FieldValue.increment(1),
            'last_update': Firestore.FieldValue.serverTimestamp()
        }, { merge: true }),
        messageDoc.set(storeMessage)
    ]);
}

exports.getReactionList = async () => {
    const firestore = new Firestore();

    const reactions = await firestore.collection('floppy').where('count', '>', 0).get();
    return reactions.docs.map(doc => {
        const data = doc.data();
        const last_update = data.last_update.toDate();
        return {
            id: doc.id,
            ...data,
            last_update
        }
    });
}

exports.updateEmoji = async (reaction) => {
    const emojis = await webClient.emoji.list();
    const firestore = new Firestore();

    Object.keys(emojis.emoji).forEach(emoji => {
        if (!(reaction && emoji !== reaction)) {
            const iconUrl = emojis.emoji[emoji];
            const reactionDoc = firestore.collection('floppy').doc(emoji);
            reactionDoc.set({
                alias: iconUrl
            }, { merge: true });
        }
    });
}


exports.getMessages = async (reaction) => {
    const firestore = new Firestore();
    const messages = await firestore.collection('floppy').doc(reaction).collection('posts').get();
    return messages.docs.map(doc => {
        const data = doc.data();

        return {
            ...data,
            ts: data.ts.toDate()
        }
    });
}


const parseUserMessage = (channel, message, user) => {
    const ts_str = message.ts.replace('.', '');
    const message_link = `https://kuiski.slack.com/messages/${channel}/p${ts_str}`;

    return {
        message_url: message_link,
        ts: message.ts,
        channel: channel,
        user_type: 'user',
        user_id: user.id,
        username: user.profile.display_name_normalized,
        icon: user.profile.image_48,
        text: message.text,
        attachments: message.attachments || [],
        reactions: message.reactions || []
    }
}

const parseBotMessage = (channel, message) => {
    const ts_str = message.ts.replace('.', '');
    const message_link = `https://kuiski.slack.com/messages/${channel}/p${ts_str}`;

    return {
        message_url: message_link,
        ts: message.ts,
        channel: channel,
        user_type: 'bot',
        user_id: message.bot_id,
        username: message.username,
        icon: message.icons.image_48,
        text: message.text,
        attachments: message.attachments || [],
        reactions: message.reactions || []
    }
}

const getMessage = async (event) => {
    const history = await webClient.conversations.history({
        channel: event.item.channel,
        latest: event.item.ts,
        inclusive: true,
        limit: 1
    });

    const message = history.messages[0];
    if (message.subtype === 'bot_message') {
        return parseBotMessage(event.item.channel, message);
    }

    const user = await webClient.users.info({
        user: message.user
    });

    return parseUserMessage(event.item.channel, message, user.user);
}
