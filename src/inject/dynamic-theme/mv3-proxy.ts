import {logInfo} from '../utils/log';

import {injectProxy} from './stylesheet-proxy';

document.currentScript && document.currentScript.remove();

const key = 'darkreaderProxyInjected';
const EVENT_DONE = '__darkreader__stylesheetProxy__done';
const EVENT_ARG = '__darkreader__stylesheetProxy__arg';

const registeredScriptPath = !document.currentScript;

function isProxyArgs(detail: any): detail is {enableStyleSheetsProxy: boolean; enableCustomElementRegistryProxy: boolean} {
    return Boolean(detail) && typeof detail.enableStyleSheetsProxy === 'boolean' && typeof detail.enableCustomElementRegistryProxy === 'boolean';
}

// createStaticStyleOverrides() dispatches __darkreader__cleanUp before every
// __darkreader__stylesheetProxy__arg. The cleanup restores native CSSStyleSheet
// methods. A one-shot listener then ignores the following arg, so later
// insertRule() calls (Emotion speedy mode, used by zhihu.com comment dialogs)
// never reach the dynamic theme. Keep listening and install again after each
// cleanup. A same-turn lock stops the manifest copy and the registered copy
// from wrapping the methods twice.
const proxyLock = 'darkreaderProxyLock';

function injectProxyAndCleanup(args: {enableStyleSheetsProxy: boolean; enableCustomElementRegistryProxy: boolean}) {
    const root = document.documentElement;
    if (root.dataset[proxyLock] === '1') {
        return;
    }
    root.dataset[proxyLock] = '1';
    queueMicrotask(() => {
        delete root.dataset[proxyLock];
    });

    document.dispatchEvent(new CustomEvent('__darkreader__cleanUp'));
    root.dataset[key] = 'true';
    logInfo(`MV3 proxy injector: ${registeredScriptPath ? 'registered' : 'dedicated'} path runs injectProxy(${args.enableStyleSheetsProxy}, ${args.enableCustomElementRegistryProxy}).`);
    injectProxy(args.enableStyleSheetsProxy, args.enableCustomElementRegistryProxy);
    document.dispatchEvent(new CustomEvent(EVENT_DONE));
}

function regularPath() {
    const argString = document.currentScript!.dataset.arg;
    if (argString !== undefined) {
        const args: {enableStyleSheetsProxy: boolean; enableCustomElementRegistryProxy: boolean} = JSON.parse(argString);
        logInfo(`MV3 proxy injector: regular path runs injectProxy(${argString}).`);
        injectProxyAndCleanup(args);
    }
}

function dataReceiver(e: any) {
    if (!isProxyArgs(e.detail)) {
        logInfo(`MV3 proxy injector: ${registeredScriptPath ? 'registered' : 'dedicated'} path ignores arg without proxy flags.`);
        return;
    }
    injectProxyAndCleanup(e.detail);
}

function dedicatedPath() {
    logInfo(`MV3 proxy injector: ${registeredScriptPath ? 'registered' : 'dedicated'} path setup...`);
    // Capture must stay unset so the event dispatched from the isolated world is received.
    // The listener stays for the life of the document: each theme rebuild cleans the
    // proxy up and then asks for it again.
    document.addEventListener(EVENT_ARG, dataReceiver);
}

function inject() {
    if (document.documentElement.dataset[key] !== undefined) {
        logInfo('MV3 proxy injector: proxy exits because everything is done.');
        return;
    }
    logInfo('MV3 proxy injector: proxy attempts to inject...');
    document.currentScript && regularPath();
    dedicatedPath();
}

inject();
