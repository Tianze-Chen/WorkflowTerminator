import {
    WorkflowCallback,
    WorkflowEvent,
    WorkflowEventListener,
    WorkflowEventMap,
    WorkflowHandler,
    WorkflowHandlerMap,
    WorkflowKey,
    WorkflowRelianceMap,
    WorkflowTerminator
 } from "./WorkflowTerminator";

const InitApp = "INIT_APP";
const UpdateInfo = "UPDATE_INFO";
const Download = "DOWNLOAD";
const LoadWebview = "LOAD_WEBVIEW";
const CreateWebview = "CRETE_WEBVIEW";
const InitWorker = "INIT_WORKER";
const LoadRenderBundle = "LOAD_RENDER_BUNDLE";
const LoadWorkerBundle = "LOAD_WORKER_BUNDLE";
const LoadAppBundle = "LOAD_APP_BUNDLE";

const AppStart = "APP_START";
const DataReady = "DATA_READY";
const WebViewLoaded = "WEBVIEW_LOADED";
const Allfinished = "ALL_FINISHED";

let mockHandler: WorkflowHandler = (callback: WorkflowCallback) => {
    setTimeout(() => {
        callback(true);
    }, 100);
};

const handlers: WorkflowHandlerMap = new Map<WorkflowKey, WorkflowHandler>([
    [InitApp, mockHandler],
    [UpdateInfo, mockHandler],
    [Download, mockHandler],
    [LoadWebview, mockHandler],
    [CreateWebview, mockHandler],
    [InitWorker, mockHandler],
    [LoadRenderBundle, mockHandler],
    [LoadWorkerBundle, mockHandler],
    [LoadAppBundle, mockHandler]
]);

const reliance: WorkflowRelianceMap = new Map<WorkflowKey, Array<WorkflowKey>>([
    [InitApp, []],
    [UpdateInfo, [InitApp]],
    [Download, [UpdateInfo]],
    [LoadWebview, [InitApp]],
    [CreateWebview, [LoadWebview]],
    [InitWorker, [LoadWebview]],
    [LoadRenderBundle, [CreateWebview]],
    [LoadWorkerBundle, [InitWorker]],
    [LoadAppBundle, [LoadWorkerBundle, LoadRenderBundle]],
]);

const events: WorkflowEventMap = new Map<WorkflowEvent, Set<WorkflowKey>>([
    [AppStart, new Set([InitApp])],
    [DataReady, new Set([UpdateInfo, LoadWebview])],
    [WebViewLoaded, new Set([LoadWebview, CreateWebview, InitWorker])],
    [Allfinished, new Set([InitApp, UpdateInfo, Download, LoadWebview, CreateWebview, InitWorker, LoadRenderBundle, LoadWorkerBundle, LoadAppBundle])]
]);

function onAppStart() {
    console.log("onAppStart");
}

function onDataReady() {
    console.log("onDataReady");
}

function onWebviewLoaded() {
    console.log("onWebviewLoaded");
}

function onAllFinished() {
    console.log("onAllFinished");
}

function onEvent(event: WorkflowEvent) {
    if (event == AppStart) {
        onAppStart()
    } else if (event == DataReady) {
        onDataReady()
    } else if (event == WebViewLoaded) {
        onWebviewLoaded()
    } else if (event == Allfinished) {
        onAllFinished()
    }
};

const terminator = new WorkflowTerminator();

terminator.registerEventListener(onEvent);
terminator.registerEvents(events);
terminator.registerHandlers(handlers);
terminator.registerReliance(reliance);

terminator.run();