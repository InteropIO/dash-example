import React from 'react';

const clientFullName = ({ firstName, lastName } = {}) => `${firstName} ${lastName}`;

function ClientDetails({ client }) {
    return <div class="card">
        <div class="card-body d-flex justify-content-between">
            <h5 class="card-title">{client != null ? clientFullName(client) : null}</h5>
            <p class="card-text">Portfolio Value: ${client?.portfolioValue}</p>
        </div>
    </div>
}

export default ClientDetails;