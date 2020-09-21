import React from 'react';

// The value that will be displayed as an option in the channel selector widget when the application has not joined a channel yet.
// The user can select this option from the UI to make the application leave the current channel.
export const NO_CHANNEL_VALUE = 'No channel';

export const REQUEST_OPTIONS = {
    headers: { accept: 'application/json' }
};

export const CLIENTS_DATA_URL = '/api/clients/'

export const STOCKS_DATA_URL = '/api/stocks/'

export const PRICE_RISING = <svg color="green" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z" />
</svg>

export const PRICE_FALLING = <svg color="red" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z" />
</svg>
