import * as React from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../style.css';
import { LoadingMessage, LoadingMenu } from '../components/Loading';
import Sidebar from '../components/Sidebar';
import Message from '../components/Message';
import ReactionEmoji from '../components/ReactionEmoji';

import {
    Feed,
    Header,
    Segment
} from 'semantic-ui-react';

const Index = (props) => {
    const [reactions, setReactions] = React.useState();
    const [selectedReaction, setSelectedReaction] = React.useState();
    const [messageLoading, setMessageLoading] = React.useState(false);
    const [messages, setMessages] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/reactions');
            const r = await res.json();
            setReactions(r);
        }
        fetchData();
    }, []);

    React.useEffect(() => {
        if (!selectedReaction || !messageLoading) return;

        async function fetchData() {
            const res = await fetch(`/api/reactions/${selectedReaction.id}`);
            const r = await res.json();
            setMessages(r);
            setMessageLoading(false);
        };
        fetchData();
    }, [selectedReaction, messageLoading])

    const onReactionSelected = React.useCallback((reaction) => {
        setMessageLoading(true);
        setSelectedReaction(reaction);
    }, [messageLoading]);

    return (
        <div className='full height'>
            <Sidebar reactions={reactions} onReactionSelected={onReactionSelected} />
            <div className='right-content' >
                <Segment basic>
                    {selectedReaction && (
                        <Header as='h1'>
                            <ReactionEmoji reaction={selectedReaction} />
                            <span> {selectedReaction.name}</span>
                        </Header>
                    )}
                </Segment>
                <Segment basic>
                    <Feed>
                        {messageLoading && <LoadingMessage />}
                        {!messageLoading && messages && messages.map(
                            message => <Message message={message} />
                        )}
                    </Feed>
                </Segment>
            </div>
        </div>
    );
}

Index.getInitialProps = async function () {
    return {
        isServer: typeof window === 'undefined'
    }
}

export default Index;