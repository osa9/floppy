import {
    Menu,
    Image
} from 'semantic-ui-react';
import { LoadingMenu } from './Loading';
import ReactionEmoji from './ReactionEmoji';

const Sidebar = ({ reactions, onReactionSelected }) => (
    <Menu vertical inverted className='left-menu'>
        <Menu.Item header>REACTIONS</Menu.Item>
        {!reactions && <LoadingMenu />}
        {reactions && reactions.map(reaction => (
            <Menu.Item as='a' key={reaction.id} onClick={() => onReactionSelected(reaction)}>
                <span><ReactionEmoji reaction={reaction} /> </span>
                <span>{reaction.name}</span>
            </Menu.Item>
        ))}
    </Menu>
);

export default Sidebar;