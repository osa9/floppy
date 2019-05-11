import { Placeholder } from 'semantic-ui-react';

export const LoadingMenu = () => (
    <Placeholder inverted>
        <Placeholder.Line length='long' />
        <Placeholder.Line length='long' />
        <Placeholder.Line length='long' />
        <Placeholder.Line length='long' />
    </Placeholder>
);


export const LoadingMessage = () => (
    <Placeholder>
        <Placeholder.Header image>
            <Placeholder.Line length='very long' />
            <Placeholder.Line length='very long' />
        </Placeholder.Header>
        <Placeholder.Header image>
            <Placeholder.Line length='very long' />
            <Placeholder.Line length='very long' />
        </Placeholder.Header>
    </Placeholder>
);