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
  // TODO: Add actions 1d.
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

  // TODO: create a Activity record(by API) 4h.
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

  // TODO: create a Call record(by API) 4h.
  getCallObject = (id: string): Promise<CallObjectDetails> => {
    console.log('getCallObject', id);
    return Promise.resolve({});
  };

  linkToCurrentHandler = (id: string): Promise<void> => {
    console.log('linkToCurrentHandler', id);
    return Promise.resolve();
  };

  // TODO: set the matrix settings 4h.
  supportMatrixHandler = (): Promise<SupportMatrixResponse> => {
    console.log('supportMatrixHandler');
    return Promise.resolve({});
  };

  // TODO: add search Contact by phone number 4h.
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

  // TODO: update a Call record(by API) 4h.
  upsertCallRecordHandler = (
    data: CallRecordData
  ): Promise<UpsertCallRecordResult> => {
    console.log('upsertCallRecordHandler', data);
    console.log('Emitting call answered event with data:', data);
    this.webphoneComponent.callAnswered.emit(data);
    // if (event.data.includes('__post_robot')) {
    //   console.log('Received data that has post_robot:', event);
    //   const parsedData = JSON.parse(event.data);
    //   const callData = parsedData.__post_robot_10_0_46__[0].data.data;
    //   if (callData.callId && callData.phoneNumber) {
    //     this.callAnswered.emit({
    //       callId: callData.callId,
    //       phoneNumber: callData.phoneNumber,
    //       direction: callData.direction,
    //     });

    //     console.log('Call answered:', {
    //       callId: callData.callId,
    //       phoneNumber: callData.phoneNumber,
    //       direction: callData.direction,
    //     });
    //   }
    // }

    const payload = {
      PhoneNumber: data.phoneNumber,
      IntegrationId: data.callId,
      Direction: data.direction,
      Subject: data.subject,
    };
    console.log('Calling API', payload);
    // return firstValueFrom(
    //   this.httpClient.post(
    //     'http://localhost/Creatio/0/rest/FocusWebphoneService/calls',
    //     payload
    //   )
    // )
    //   .then((response) => {
    //     console.log('UPSERT API upsert response:', response);
    //     return { id: response!.toString() };
    //   })
    //   .catch((error) => {
    //     throw new Error(`UPSERT API error: ${error}`);
    //   });
    console.log('Base url', this.webphoneComponent.baseUrl);
    return this.httpClientService
      .post<{Data: string}>(
        `${this.webphoneComponent.baseUrl}/rest/FocusWebphoneService/calls`,
        payload,
        { responseType: 'json' }
      )
      .then((response) => {
        return { id: response.body!.Data! };
      })
      .catch((error) => {
        console.error('UPSERT API error:', error);
        this.webphoneComponent.errorOccurred.emit({
          messageCode: 'UPSERT_API_ERROR',
          message: `Error occurred while upserting call record: ${error}`
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
  constructor(public httpClient: HttpClient) {
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
  callAnswered = new EventEmitter<CallRecordData>();

  @Input()
  @CrtInput()
  baseUrl: string = 'http://localhost/Creatio/0';

  @Input()
  @CrtInput()
  token: string =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvNGUud2VseW8ucGwiLCJhdWQiOiJodHRwczpcL1wvNGUud2VseW8ucGwiLCJpYXQiOjE3NTQzMDQ3OTAsIm5iZiI6MTc1NDMwNDc5MCwiZXhwIjoxNzU2ODk2NzkwLCJjdXN0b21lcklkIjo2NDA4OTEsInVzZXJJZCI6MzYyMTUsInNlc3Npb25JZCI6IlF0R0p4NlFjNHl5SGR4MWExRkRMeFVTQlk0MTJzWUYwTnFoMG1ZM3E4dnB6SHJ2YU8yZHVtRmRZVFBod0YzczhIMWtoQ3RwZjc3azBiS1IyZENhTmxnbW11RlliSmhZUnA3LGs1U3YzbjBmcUlTaWJvcGNaMVhjTkpYOGFZNXVxIiwibW9kZSI6ImlwdCIsInR5cGUiOiJ3ZWJwaG9uZSIsImZ1bGxOYW1lIjoiUEJYIn0.FDsssqgkbnwWL-IFAMfa0z5w63tB0p1r1Aw_cQwhqIoHGj4W8ht-pJ9Tom5_PpCzE7NWFBzsJS3InGpUsxUbrx8PnYeA7JdzhvVGhU4cg9hRvV_tXHtePpL1scLzuAAWAhTwJdEiehq_JO_TzgLjen1YdWiyvGxPkLEqJ4dcHl-Bx77vDsIAyTA87B188LDAPBRoSfn52Eon3WmV0PO0n2Q5R0NpNAnYzTru0lDAuyIGbzJxqbkRr3_NUTjrHUVKfD4ieV1EHvi8RYQlT1TApNnUdc3URIw_y-Y3EQnAkKW56mBw10mZKf4Bh8ET0vf8cl4aI5MeTzfy55W_AqJlKTpjfQal515ZY-oEW_sNqGnmTGwW5dBCwhPfwPabMP7rNhnRonFRI26sLZbbsfhz6p1Xw2yCLBUoGD4RVnXjwklb5_TWcZxnBzlUVbXUz5RhuMg_Uq3ywgQAhqr8J9XfKgtqRAaFO8m_LJj7r2PQbSozxaQMD8-LU-5fvue5gPS9_C7BDHhlMpbXMlArJ2DdPrgZGBcLl41OSvInnEVYSVD7b2tr5fKfkBpnD4D1xIQMvshHYRqEJVHsCFC65DViQYRVA4TLrWMilsIsQDWTJT6TaL0L9_yHBpv0ZcoSox92zwmy_o7MfnLjEssdRsUrOZsWD3v2xLxUYZJDjRvuq5E';

  @Input()
  @CrtInput()
  userId: string = 'PBX';

  @Input()
  @CrtInput()
  domain: string = 'demo-deloiite-creatio';

  @Input()
  @CrtInput()
  mode: 'dev' | 'prod' = 'prod';

  private webphone: any;

  ngOnInit(): void {
    // console.log('Setting up event listeners');
    // window.addEventListener('message', (event) => {
    //   console.log('Received message:');
    //   if (
    //     event.data.action === 'phoneStatusChanged' &&
    //     event.data.data.status === 'ringing'
    //   ) {
    //     console.log('Call received:', event);
    //     this.callReceived.emit(true);
    //   }
    //   if (event.data.includes('__post_robot')) {
    //     console.log('Received data that has post_robot:', event);
    //     const parsedData = JSON.parse(event.data);
    //     const callData = parsedData.__post_robot_10_0_46__[0].data.data;
    //     if (callData.callId && callData.phoneNumber) {
    //       this.callAnswered.emit({
    //         callId: callData.callId,
    //         phoneNumber: callData.phoneNumber,
    //         direction: callData.direction,
    //       });
    //       console.log('Call answered:', {
    //         callId: callData.callId,
    //         phoneNumber: callData.phoneNumber,
    //         direction: callData.direction,
    //       });
    //     }
    //   }
    // });
  }

  // async ngOnInit(): Promise<void> {
  //       const connector =
  //     (await window.WebphoneConnectorSDK) ||
  //     window.WebphoneConnector ||
  //     window.WebphoneConnectorSDK?.WebphoneConnector;
  //   setTimeout(() => {
  //     const config = {
  //       container: '#fc-webphone-iframe',
  //       userId: this.userId,
  //       mode: this.mode,
  //       adapter: new AngularWebphoneAdapter(),
  //       authData: {
  //         domain: this.domain,
  //         token: this.token,
  //       },
  //       type: 'creatio',
  //     };
  //     this.webphone = new connector(config, window);
  //     console.log('booting');
  //     this.webphone.boot();
  //   }, 1);
  // }
  async ngAfterViewInit() {
    const connector =
      (await window.WebphoneConnectorSDK) ||
      window.WebphoneConnector ||
      window.WebphoneConnectorSDK?.WebphoneConnector ||
      window.WebphoneConnectorSdkExports;
    this.initiationTimemoutId = setTimeout(() => {
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
    }, 1);
  }

  ngOnDestroy(): void {
    this.webphone?.logoutWp?.();
    this.initiationTimemoutId && clearTimeout(this.initiationTimemoutId);
  }
}
