/* eslint-disable no-undef */
const APP_NAME = "JSApp3";

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
  .then(() => {
    document
      .getElementById("methodInvokeBtn")
      .addEventListener("click", invokeGlueMethodHandler);

    const longsList = document.getElementById("logs-list");

    glue.interop.register("Send.Message", ({ message }) => {
      const li = document.createElement("li");
      const textNode = document.createTextNode(message);

      li.appendChild(textNode);
      longsList.appendChild(li);
    });
  })
  .catch(console.error);

async function invokeGlueMethodHandler() {
  const methodDefinition = { name: "Send.Message" };

  try {
    const message = document.getElementById("message").value;

    await glue.interop.invoke(methodDefinition, { message }, "skipMine");
  } catch (error) {
    console.error(
      `Failed to invoke "${methodDefinition.name}". Error: `,
      error
    );
    console.error(
      error.message || `Failed to invoke "${methodDefinition.name}".`
    );
  }
}
