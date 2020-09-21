import { NO_CHANNEL_VALUE } from './constants';

// Get the channel names and colors using the Channels API.
export const getChannelNamesAndColors = async glue => {
    const channelContexts = await glue.channels.list();
    const channelNamesAndColors = channelContexts.map(channelContext => ({
        name: channelContext.name,
        color: channelContext.meta.color
    }));
    return channelNamesAndColors;
};

// Join the given channel (or leave the current channel if NO_CHANNEL_VALUE is selected).
export const joinChannel = glue => ({ value: channelName }) => {
    if (channelName === NO_CHANNEL_VALUE) {
        if (glue.channels.my()) {
            glue.channels.leave();
        }
    } else {
        glue.channels.join(channelName);
    }
};

// Subscribe for the current channel with the provided callback.
export const subscribeForChannels = handler => glue => {
    glue.channels.subscribe(handler);
};
