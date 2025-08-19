import { SemVer } from 'semver';

export declare interface AdapterLoader {
    prompt: (message: string) => void;
    finish: () => void;
    error: (message_code: string, message: string) => void;
}

export declare interface AuthData {
    /**
     * Fcc tenant domain.
     */
    domain: string;
    /**
     * Token retrived from external-api for authorizating connector instance.
     */
    token: string;
}

/**
 * Structure describies payload used to change call assignments in FCC.
 */
export declare interface CallAssignments {
    /**
     * Identifier of the object representing the company associated with the call.
     */
    recordId: string;
    /**
     * Identifier of the object representing the individual associated with the call.
     */
    recordType: string;
}

/**
 * Structure describies given call object from your system. Used to retrive data for both ended and active calls.
 */
export declare interface CallObjectDetails {
    /**
     * Identifier of the object representing the company associated with the call.
     */
    accountId?: string;
    /**
     * Identifier of the object representing the individual associated with the call.
     */
    whoId?: string;
    /**
     * The identifier of the object representing the Ticket (case) associated with the call. This should be something that can be done.
     */
    whatId?: string;
    /**
     * System identifier for the connection provided.
     */
    id?: string;
}

/**
 * Create call record representing call in your system.
 */
export declare interface CallRecordData {
    /**
     * Call Id.
     */
    callId?: number;
    /**
     * Phone number.
     */
    phoneNumber?: PhoneNumber;
    /**
     * Call direction from CallCenter perspective.
     */
    direction?: "inbound" | "outbound";
    /**
     * Call record subject ex. Inbound Call (Answered) from: +48XXXXXXX.
     */
    subject?: string;
}

export declare interface CallTicket {
    /**
     * Thing number that is used in CRM for display entity.
     */
    ticketNumber?: string;
    /**
     * Thing Id in crm system.
     */
    ticketId?: string;
    /**
     * Thing subject/topic a brief description.
     */
    subject?: string;
}

export declare interface ChangeUserStatus {
    statusId: string;
}

export declare class ConnectorBridge {
    private readonly wpWindow;
    private readonly destinationHost;
    constructor(wpWindow: Window);
    private sendMessage;
    private sendAsyncMessage;
    showObject(objectId: string): void;
    navigateToObject(objectId: string): void;
    createEntity(entityData: CreateEntity): void;
    getConnectorDetails(): Promise<{
        type: string;
        version: SemVer | null;
    }>;
    linkToCurrent(id: string): Promise<object>;
    getCallObject(callId: string): Promise<CallObjectDetails>;
    getUserStatus(): Promise<string | null>;
    getIconUrl(entityType: string): Promise<string>;
    getSupportMatrix(): Promise<SupportMatrixResponse>;
    searchObjects({ phoneNumber, vid }: {
        phoneNumber?: PhoneNumber;
        vid?: string;
    }): Promise<SearchObjectList[]>;
    upsertTask(task: CallRecordData): Promise<UpsertCallRecordResult>;
}

export declare interface CreateEntity {
    /**
     * Entity type to create.
     */
    entity?: string;
    /**
     * Phone number.
     */
    phoneNumber?: PhoneNumber;
    /**
     * Id from crm system.
     */
    vid?: string;
    /**
     * Call id from FCC
     */
    callId?: string;
}

export declare type Email = `${string}@${string}\\.${string}`;

export declare type PhoneNumber = `+${number}` | `${number}`;

export declare type PhoneStatus = "ready" | "idle" | "notready" | "busy";

export declare interface PlaceCall {
    phoneNumber: PhoneNumber;
    /**
     * ID of object that we will call.
     */
    vid: string;
    /**
     * Thing releated to called vid
     */
    ticket?: string | null;
}

/**
 * Structure describing given object from your system. Used to retrive data for ended and active calls.
 */
export declare interface SearchObjectList {
    /**
     * System ID of object.
     */
    id: string;
    /**
     * Object ID for external systems.
     */
    vid: string;
    /**
     * Object owner id.
     */
    ownerId: string;
    /**
     * Entity type.
     */
    type: string;
    /**
     * Phone number
     */
    phone: PhoneNumber;
    /**
     * Email
     */
    email?: Email;
    /**
     * Name in format for displaying in phone.
     */
    displayName: string;
    /**
     * Absolute url to object.
     */
    profileUrl?: string;
    /**
     * Company name.
     */
    company?: string;
    /**
     * Firstname.
     */
    firstname?: string;
    /**
     * LastName.
     */
    lastname?: string;
    /**
     * Object id for accessing using URI's, null otherwise.
     */
    portalId?: string;
}

export declare interface SearchTerm {
    phoneNumber?: string;
    vid?: string;
}

export declare interface SupportMatrixResponse {
    Inbound?: {
        objects: {
            [key: string]: any;
        };
    };
    Outbound?: {
        objects: {
            [key: string]: any;
        };
    };
}

export declare interface UpsertCallRecordResult {
    id: string;
}

export declare type UserStatus = 'ready' | 'busy' | 'suspend' | 'away' | 'wrap' | 'pause' | 'in_campaign';

/**
 * Structure of Webphone Adapter
 */
export declare interface WebphoneAdapter {
    loader: AdapterLoader;
    createEntityHandler: (createEntityPayload: CreateEntity) => Promise<void>;
    onToggleClick2Dial: (enable: boolean, status: PhoneStatus) => Promise<void>;
    onUserStatusChanged?: (id: string, status: UserStatus) => Promise<void>;
    getCallObject: (callId: string) => Promise<CallObjectDetails>;
    getUserStatus?: () => Promise<string | null>;
    linkToCurrentHandler?: (taskId: string) => Promise<void>;
    supportMatrixHandler: () => Promise<SupportMatrixResponse>;
    searchHandler?: (term: SearchTerm) => Promise<Array<SearchObjectList>>;
    popSoftphoneHandler?: (visibility: boolean) => Promise<void>;
    navigateToObjectHandler?: (objectId: string, entityName?: string) => Promise<void>;
    upsertCallRecordHandler: (taskData: CallRecordData) => Promise<UpsertCallRecordResult>;
    iconHandler: (type: string) => Promise<string>;
}

/**
 * Structure of Webphone Connector Configuration
 */
export declare interface WebphoneConnectorConfig {
    /**
     * Integration type supported by FCC backend. Contact CC for get integration name.
     */
    type: string;
    /**
     * Selector for html object, phone iframe will be placed in it. If object is iframe, ensure it's not visible by default `style="visibility:hidden"`.
     */
    container: string;
    /**
     * Current logged in user Id in your system.
     */
    userId: string;
    /**
     * Connector mode.
     */
    mode?: "dev" | "prod";
    /**
     * Webphone adapter in your system.
     */
    adapter: WebphoneAdapter;
    /**
     * Authorization Data for current user.
     */
    authData: AuthData;
}

declare class WebphoneConnectorSdk {
    #private;
    private authorizeHandler;
    private placeCallHandler;
    private assignCallHandler;
    private setTicketHandler;
    private changeUserStatusHandler;
    private setCssApplierHandler;
    private logoutHandler;
    private webphonePostRobotHandler;
    private webphoneEventHandler;
    private ajv;
    readonly configuration: WebphoneConnectorConfig & {
        mode: "prod" | "dev";
    };
    readonly phoneWindow: Window;
    readonly wpWindow: HTMLIFrameElement;
    constructor(configuration: WebphoneConnectorConfig, phoneWindow: Window);
    boot(): void;
    isLoaded(): boolean;
    private validConfiguration;
    private validAndPrepareWpWindow;
    private validatePayloadUsingSchema;
    private initHandlers;
    private initListeners;
    placeCall(payload: PlaceCall): Promise<boolean>;
    changeContactAssigments(payload: CallAssignments): Promise<boolean>;
    changeUserStatus(payload: ChangeUserStatus): Promise<boolean>;
    setTicket(payload: CallTicket): Promise<boolean>;
    setCss(payload: string): Promise<boolean>;
    authorizeWp(): Promise<boolean>;
    logoutWp(): Promise<boolean>;
}
export default WebphoneConnectorSdk;

export { }
