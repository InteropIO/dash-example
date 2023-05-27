(() => {
    /**
     * "window.glue42dash.libSettings" is a config object which enables applications to provide settings to dash-glue42 from JavaScript code.
     * 
     * "libSettings" interface:
     * {
     *      web: {
     *          factory: Glue42WebFactoryFunction, // Accepts the factory function exposed by @glue42/web. Define this if you want to override the Web Client library.
     *          libraries: ((glue: Glue, config?: Config) => Promise<void>)[] // A list of glue libraries which will be initiated internally and provide access to specific functionalities.
     *      },
     *      webPlatform: {
     *          factory: Glue42WebPlatformFactoryFunction, // Accepts the factory function exposed by @glue42/web-platform. Define this if you want to override the Web Platform library.
     *          libraries: ((glue: Glue, config?: Config) => Promise<void>)[] // A list of glue libraries which will be initiated internally and provide access to specific functionalities.
     *      },
     *      desktop: {
     *          factory: Glue42DesktopFactory, // Accepts the factory function exposed by @glue42/desktop. Define this if you want to override the Enterprise library.
     *          libraries: ((glue: Glue, config?: Config) => Promise<void>)[] // A list of glue libraries which will be initiated internally and provide access to specific functionalities.
     *      },
     * }
     * 
     * All three properties "web", "webPlatform" and "desktop" are optional.
     * 
     * --- Skip Glue42 Initialization ---
     * Since we can override the factory functions via "window.glue42dash.libSettings", dash-glue42 enables applications to skip the real Glue42 JS initialization.
     * If a factory function returns a "fake" glue object with a property "skipInit", the Glue42 component will render the component's children without glue.
     * In this case other components exposing glue42 functionalities won't function (keep this in mind if you expect Input from a dash-glue42 component or update a props from a callback).
     * "skipInit" is an additional logic only for Dash apps. The property is not part of the official glue js api.
     * 
     * See the example below which demonstrates how you can enable Glue42 to render children without running in the Glue42 Enterprise container or the application being a Core(+) client.
     */

    // Note: "glue42gd" and "glue42dash" are different object. If "glue42gd" is available then the application runs in the Glue42 Enterprise container.
    const inGlue42Enterprise = !!window.glue42gd

    if (inGlue42Enterprise === false) {
        window.glue42dash.libSettings = {
            web: {
                factory: () => Promise.resolve({ skipInit: true })
            },
            desktop: {
                factory: () => Promise.resolve({ skipInit: true })
            },
            webPlatform: {
                factory: () => Promise.resolve({ skipInit: true })
            },
        }
    }
})();