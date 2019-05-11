import { Feed, Image } from 'semantic-ui-react';
import moment from 'moment';

const Message = ({ message }) => (
    <Feed.Event key={message.ts}>
        <Feed.Label>
            <Image src={message.icon} rounded />
        </Feed.Label>
        <Feed.Content>
            <Feed.Date>{moment(message.ts).format('YYYY/MM/DD HH:MM')}</Feed.Date>
            <Feed.Summary as='a'>{message.username}</Feed.Summary>
            <Feed.Extra>{message.text}</Feed.Extra>
            {message.attachments && (
                <div className='attachment'>
                    {message.attachments.map(attachment => (
                        <>
                            <div>{attachment.title}</div>
                            <div>{attachment.text}</div>
                            {attachment.image_url && <Image src={attachment.image_url} width={300} />}
                        </>

                    ))}
                </div>
            )}
        </Feed.Content>
    </Feed.Event>
)

export default Message;