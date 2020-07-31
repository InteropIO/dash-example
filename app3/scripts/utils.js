/* eslint-disable no-undef */
(function (window) {
  const toggleGlueAvailable = () => {
    document.getElementById("glueImg").src = "assets/connected.svg";
    document.getElementById("glueSpan").textContent = "Glue Connected";
  };

  const setDocumentTitle = (title) => {
    document.title = title;
  };

  const displayAppName = (text) => {
    const el = document.getElementById("appNameHeading");
    if (el) {
      el.textContent = text;
    }
  };

  window.toggleGlueAvailable = toggleGlueAvailable;
  window.setDocumentTitle = setDocumentTitle;
  window.displayAppName = displayAppName;
})(window || {});
