export type WorkflowCallback = (success: boolean) => void;
export type WorkflowKey = string;
export type WorkflowHandler = (callback: WorkflowCallback) => void;
export type WorkflowHandlerMap = Map<WorkflowKey, WorkflowHandler>;
export type WorkflowRelianceMap = Map<WorkflowKey, Array<WorkflowKey>>;
export type WorkflowEvent = string;
export type WorkflowEventMap = Map<WorkflowEvent, Set<WorkflowKey>>;
export type WorkflowEventListener = (event: WorkflowEvent) => void;

export class WorkflowTerminator {

    private _handlers!: WorkflowHandlerMap;

    private _reliances!: WorkflowRelianceMap;

    private _events?: WorkflowEventMap;

    private _running: Set<WorkflowKey>;

    private _finished: Set<WorkflowKey>;

    private _listener?: WorkflowEventListener;

    constructor() {
        this._running = new Set<WorkflowKey>();
        this._finished = new Set<WorkflowKey>();
    }

    public registerHandlers(handlers: WorkflowHandlerMap): void {
        this._handlers = handlers;
    }

    public registerReliance(reliance: WorkflowRelianceMap): void {
        this._reliances = reliance;
    }

    public registerEvents(events: WorkflowEventMap): void {
        this._events = events;
    }

    public registerEventListener(listener: WorkflowEventListener): void {
        this._listener = listener;
    }

    public run(): boolean {
        if (this._handlers && this._reliances) {
            return this.checkWorkflow();
        } else {
            return false;
        }
    }

    private checkWorkflow(): boolean {
        if (this._finished.size == this._handlers.size) {
            return true;
        } else {
            for (const [key, handler] of this._handlers) {
                if (this.isWorkflowReadyToRun(key)) {
                    console.log("start workflow:" + key);
                    this._running.add(key);
                    handler((result: boolean) => {
                        this.onWorkflowCallback(key, result);
                    });
                }
            }
            return false;
        }
    }

    private checkEvents(key: WorkflowKey): void {
        if (this._listener && this._events) {
            for (const [event, keys] of this._events) {
                if (keys.has(key)) {
                    if (this.isEventReady(event)) {
                        console.log("dispatch eveny:" + event);
                        this._listener(event);
                    }
                }
            }
        }
    }

    private checkStatus(): void {
        console.log("show runnings:\n")
        for (const key of this._running) {
            console.log(key + "\n");
        }
        console.log("show finished:\n")
        for (const key of this._finished) {
            console.log(key + "\n");
        }
    }

    private onWorkflowCallback(key: WorkflowKey, result: boolean): void {
        console.log("on workflow callback: " + key + " result:" + result);
        this._running.delete(key);
        if (result) {
            this._finished.add(key);
            
            this.checkEvents(key);

            this.checkWorkflow();
        } else {
            this._finished.delete(key);
        }
    }

    private isWorkflowReadyToRun(key: WorkflowKey): boolean {
        return !this.isWorkflowFinished(key) && !this.isWorkflowRunning(key) && this.isWorkflowRelianceReady(key);
    }

    private isWorkflowRelianceReady(key: WorkflowKey): boolean {
        const reliances = this._reliances.get(key);
        if (reliances) {
            for (const reliance of reliances) {
                if (!this.isWorkflowFinished(reliance)) {
                    return false
                }
            }
            return true;
        } else {
            return true;
        }
    }


    private isWorkflowRunning(key: WorkflowKey): boolean {
        return this._running.has(key);
    }

    private isWorkflowFinished(key: WorkflowKey): boolean {
        return this._finished.has(key);
    }

    private isEventReady(event: WorkflowEvent): boolean {
        if (this._events) {
            const conditions = this._events.get(event);
            if (conditions) {
                for (const key of conditions) {
                    if (!this.isWorkflowFinished(key)) {
                        return false
                    }
                }
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
 
}