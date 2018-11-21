"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-var-requires
const colors = require("colors/safe");
const debug = require("debug");
const defaultNamespace = "zwave";
let customLogger;
function setCustomLogger(logger) {
    customLogger = logger;
}
exports.setCustomLogger = setCustomLogger;
colors.setTheme({
    silly: "white",
    debug: "white",
    error: "red",
    warn: "yellow",
    info: "blue",
});
function log(...args) {
    // we only accept strings
    if (!args || !args.length || !args.every(arg => typeof arg === "string")) {
        throw new Error("Invalid arguments passed to log()");
    }
    let namespace = "";
    let message;
    let severity;
    if (args.length === 2) {
        ([message, severity] = args);
    }
    else if (args.length === 3) {
        ([namespace, message, severity] = args);
        // add the namespace separator to append the namespace to the default one
        if (typeof namespace === "string" && namespace !== "")
            namespace = ":" + namespace;
    }
    if (namespace === ":self") {
        const date = new Date();
        // tslint:disable-next-line:no-console
        console.log(date + " - " + namespace + ": " + severity + ": " + message);
    }
    function defaultLogger() {
        let prefix = "";
        if (severity !== "info") {
            prefix = `[${severity.toUpperCase()}] `;
        }
        debug(defaultNamespace + namespace)(`${prefix}${colors[severity](message)}`);
    }
    (customLogger || defaultLogger)(message, severity);
}
exports.log = log;
