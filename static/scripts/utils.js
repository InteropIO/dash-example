(function (window) {
    function displayApplicationsList(applications) {
        (applications || []).forEach(app => {
            const appName = app.name;
            const displayName = app.title;

            const linkEl = document.createElement('a');
            linkEl.innerText = `${displayName}`;
            linkEl.href = `#`;

            linkEl.addEventListener('click', function () {
                startApplication(appName)
                return false;
            });

            const itemEl = document.createElement('li');
            itemEl.appendChild(linkEl);

            document.getElementById('applications-list').appendChild(itemEl);
        });
    }

    function toggleGlueAvailable() {
        document.getElementById("glueImg").src = "assets/connected.svg";
        document.getElementById("glueSpan").textContent = "Main App (Web Platform)";
    };

    window.toggleGlueAvailable = toggleGlueAvailable;
    window.displayApplicationsList = displayApplicationsList;
})(window || {});