import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  CrtInput,
  CrtOutput,
  CrtViewElement,
  HttpClientService,
  MessageChannelService,
} from '@creatio-devkit/common';
import { EventEmitter } from '@angular/core';
import type {
  WebphoneConnectorConfig,
  WebphoneAdapter,
  SearchTerm,
  SearchObjectList,
  CallRecordData,
  UpsertCallRecordResult,
  UserStatus,
  PhoneStatus,
  SupportMatrixResponse,
  CreateEntity,
  CallObjectDetails,
  AdapterLoader,
  PhoneNumber,
  Email,
} from '@ftdev/webphone-sdk';
import { HttpClient } from '@angular/common/http';

declare global {
  interface Window {
    WebphoneConnectorSDK?: any;
    WebphoneConnector?: any;
    WebphoneConnectorSdkExports?: any;
  }
}

class AngularWebphoneAdapter implements WebphoneAdapter {
  private webphoneComponent: WebphoneComponent;
  constructor(
    webphoneComponent: WebphoneComponent,
    private httpClientService: HttpClientService
  ) {
    this.webphoneComponent = webphoneComponent;
  }

  loader: AdapterLoader = {
    prompt: (message: string) => {
      console.log(`Prompt: ${message}`);
    },
    finish: () => {
      console.log('Finish');
    },
    error: (message_code: string, message: string) => {
      console.error(`Error [${message_code}]: ${message}`);
      this.webphoneComponent.errorOccurred.emit({
        messageCode: message_code,
        message,
      });
    },
  };

  createEntityHandler = (p: CreateEntity): Promise<void> => {
    console.log('createEntityHandler', p);
    return Promise.resolve();
  };

  onToggleClick2Dial = (
    enable: boolean,
    status: PhoneStatus
  ): Promise<void> => {
    console.log('onToggleClick2Dial', enable, status);
    return Promise.resolve();
  };

  getCallObject = (id: string): Promise<CallObjectDetails> => {
    console.log('getCallObject', id);
    return Promise.resolve({});
  };

  linkToCurrentHandler = (id: string): Promise<void> => {
    console.log('linkToCurrentHandler', id);
    return Promise.resolve();
  };

  supportMatrixHandler = (): Promise<SupportMatrixResponse> => {
    console.log('supportMatrixHandler');
    return Promise.resolve({});
  };

  searchHandler = (term: SearchTerm): Promise<SearchObjectList[]> => {
    console.log('searchHandler', term);
    console.log('Emitting ringing started event.');
    this.webphoneComponent.ringingStarted.emit();

    return Promise.resolve([]);
  };

  popSoftphoneHandler = (visibility: boolean): Promise<void> => {
    console.log('popSoftphoneHandler', visibility);
    return Promise.resolve();
  };

  navigateToObjectHandler = (id: string): Promise<void> => {
    console.log('navigateToObjectHandler', id);
    return Promise.resolve();
  };

  upsertCallRecordHandler = (
    data: CallRecordData
  ): Promise<UpsertCallRecordResult> => {
    console.log('upsertCallRecordHandler', data);
    console.log(
      'Show contact page for incoming call in adapter:',
      this.webphoneComponent.showContactPageForIncomingCall
    );
    console.log(
      'Show contact page for outgoing call in adapter:',
      this.webphoneComponent.showContactPageForOutgoingCall
    );
    if (
      (data.direction === 'inbound' &&
        this.webphoneComponent.showContactPageForIncomingCall) ||
      (data.direction === 'outbound' &&
        this.webphoneComponent.showContactPageForOutgoingCall)
    ) {
      console.log(
        'Show contact page for incoming call inside if in adapter:',
        this.webphoneComponent.showContactPageForIncomingCall
      );
      console.log(
        'Show contact page for outgoing call inside if in adapter:',
        this.webphoneComponent.showContactPageForOutgoingCall
      );
      console.log('Emitting call answered event with data:', data.phoneNumber!);
      this.webphoneComponent.callAnswered.emit({
        phoneNumber: data.phoneNumber!,
      });
    }

    const payload = {
      PhoneNumber: data.phoneNumber,
      IntegrationId: data.callId,
      Direction: data.direction,
      Subject: data.subject,
    };
    console.log('Calling API', payload);
    console.log('Base url', this.webphoneComponent.baseUrl);
    return this.httpClientService
      .post<{ Success: string; Data: string }>(
        `${this.webphoneComponent.baseUrl}/rest/FocusWebphoneService/calls`,
        payload,
        { responseType: 'json' }
      )
      .then((response) => {
        if (response.body?.Success === 'false') {
          throw new Error(`UPSERT API error: ${response.body?.Data}`);
        }
        return { id: response.body!.Data! };
      })
      .catch((error) => {
        console.error('UPSERT API error:', error);
        this.webphoneComponent.errorOccurred.emit({
          messageCode: 'UPSERT_API_ERROR',
          message: `Error occurred while upserting call record: ${error}`,
        });
        throw new Error(`UPSERT API error: ${error}`);
      });
  };

  onUserStatusChanged? = (id: string, status: UserStatus): Promise<void> => {
    console.log('onUserStatusChanged', id, status);
    return Promise.resolve();
  };

  iconHandler = (type: string): Promise<string> => {
    console.log('iconHandler', type);
    return Promise.resolve('url');
  };
}

@Component({
  selector: 'dbx-webphone',
  templateUrl: './webphone.component.html',
  styleUrl: './webphone.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
@CrtViewElement({
  selector: 'dbx-webphone',
  type: 'dbx.Webphone',
})
export class WebphoneComponent implements AfterViewInit, OnDestroy, OnInit {
  private creatioChannel: BroadcastChannel;
  constructor(public httpClient: HttpClient) {
    this.creatioChannel = new BroadcastChannel('webphone');
    console.log('Broadcast channel created', this.creatioChannel);
    console.log('WebphoneComponent constructor called', httpClient);
  }

  public readonly httpClientService = new HttpClientService();
  private initiationTimemoutId: any;

  @Output()
  @CrtOutput()
  errorOccurred = new EventEmitter<{ messageCode: string; message: string }>();

  @Output()
  @CrtOutput()
  ringingStarted = new EventEmitter();

  @Output()
  @CrtOutput()
  callAnswered = new EventEmitter<{ phoneNumber: string }>();

  @Input()
  @CrtInput()
  showContactPageForIncomingCall: boolean = true;

  @Input()
  @CrtInput()
  showContactPageForOutgoingCall: boolean = true;

  @Input()
  @CrtInput()
  baseUrl: string = '';

  @Input()
  @CrtInput()
  token: string = '';

  @Input()
  @CrtInput()
  userId: string = '';

  @Input()
  @CrtInput()
  domain: string = '';

  @Input()
  @CrtInput()
  mode: 'dev' | 'prod' = 'prod';

  @Input()
  @CrtInput()
  disableOrNotSetupParameters: boolean = false;

  private webphone: any;

  ngOnInit(): void {}

  async ngAfterViewInit() {
    const connector =
      (await window.WebphoneConnectorSDK) ||
      window.WebphoneConnector ||
      window.WebphoneConnectorSDK?.WebphoneConnector ||
      window.WebphoneConnectorSdkExports;
    this.initiationTimemoutId = setTimeout(() => {
      console.log(
        'Disabling or not setting up parameters',
        this.disableOrNotSetupParameters
      );
      if (!this.disableOrNotSetupParameters) {
        console.log('Initializing Webphone');
        const config: WebphoneConnectorConfig = {
          container: '#fc-webphone-iframe',
          userId: this.userId,
          mode: this.mode,
          adapter: new AngularWebphoneAdapter(this, this.httpClientService),
          authData: {
            domain: this.domain,
            token: this.token,
          },
          type: 'd365',
        };
        console.log('Webphone config', config);
        this.webphone = new connector(config, window);
        console.log('booting');
        this.webphone.boot();
        console.log(
          'Show contact page for incoming call:',
          this.showContactPageForIncomingCall
        );
        console.log(
          'Show contact page for outgoing call:',
          this.showContactPageForOutgoingCall
        );
      }
    }, 1);
    console.log('Channel on Angular', this.creatioChannel);
    this.creatioChannel.onmessage = (event) => {
      console.log('Received message from creatioChannel:', event);
      if (event.data.type === 'MAKE_CALL') {
        console.log(
          'Making call with phone number:',
          event.data.data.phoneNumber
        );
        const phoneCallConfig = {
          phoneNumber: event.data.data.phoneNumber,
          vid: '',
        };

        console.log('Phone call config:', phoneCallConfig);
        this.webphone?.placeCall(phoneCallConfig);
      }
    };
    this.creatioChannel.onmessageerror = (event) => {
      console.error('Error occurred in creatioChannel:', event);
    };
  }

  ngOnDestroy(): void {
    this.webphone?.logoutWp?.();
    this.initiationTimemoutId && clearTimeout(this.initiationTimemoutId);
  }
}
