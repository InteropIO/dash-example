/* eslint-disable no-undef */
const APP_NAME = "AppB";

async function startApp(options) {
  if (options && options.appName) {
    window.setDocumentTitle(options.appName);
    window.displayAppName(options.appName);
  }

  try {
    const glue = await window.GlueWeb();
    window.glue = glue;
    window.toggleGlueAvailable();

    console.log(`Glue42 Web version ${glue.info.version} initialized.`);

    return glue;
  } catch (error) {
    console.error('Failed to initialize Glue42 Web. Error: ', error);
    throw error;
  }
}

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
startApp({ appName: APP_NAME })
  .then((glue) => {
    glue.interop.register("SendMessage", sendMessageInvocationHandler)
      .catch(console.error);   
})

function sendMessageInvocationHandler({ message }) {
  const li = document.createElement("li");
  const textNode = document.createTextNode(message);

  li.appendChild(textNode);
  document.getElementById("logs-list").prepend(li);
}