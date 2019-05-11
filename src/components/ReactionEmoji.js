
const ReactionEmoji = ({ reaction }) => {
    if (reaction.alias) {
        return <img src={reaction.alias} style={{ height: '1em', width: '1em' }} />
    } else {
        return <span>{reaction.id}</span>
    }
}

export default ReactionEmoji;