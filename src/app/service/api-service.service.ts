import { Injectable } from '@angular/core';
import { Http, Response, Headers} from '@angular/http';
import { of } from 'rxjs/observable/of';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { Token } from '../model/Token';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiService {

  private ROOT_URL: string;
  private TIMEOUT = environment.timeout;
  private httpOptions = {headers: new Headers()};

  constructor( private http: Http, private router: Router ) {
    var protocol = environment.protocol;
    var domain = environment.domain;
    var port = environment.port;
    this.ROOT_URL = protocol + '://' + domain + ':' + port;
  }

  private getHeader(tokenType: TokenType) {
    var headerContent: Headers = new Headers({"Content-Type": "application/json"});

    if( tokenType == TokenType.BASIC ) {
      var clientId = environment.clientId;
      var clientSecret = environment.clientSecret;
      headerContent.append("Authorization", "Basic " + btoa(clientId + ":" + clientSecret))
    } else if ( tokenType == TokenType.BEARER ) {
      var token = this.getToken();
      headerContent.append("Authorization", "Bearer " + token.getAccessToken());
    }
    console.log(headerContent);
    return {headers: headerContent};
  }

  public post(endpoint: string, data: object, tokenType: TokenType, successFxn: Function,
    errorFxn:Function) {

    const url = this.ROOT_URL + endpoint;
    if (!navigator.onLine) {
      errorFxn({
        error: 'Timeout',
        message: 'Unable to access server'
      });
    } else {
      this.httpOptions = this.getHeader(tokenType);
      this.http.post(url, data, this.httpOptions)
        .subscribe((res: Response) => {
          successFxn(res.json());
        }, error => {
          errorFxn(this.handleError(error));
        });
    }
  }

  public get(endpoint: string, tokenType: TokenType, successFxn: Function, errorFxn:Function) {

    const url = this.ROOT_URL + endpoint;
    if (!navigator.onLine) {
      errorFxn({
        error: 'Timeout',
        message: 'Unable to access server'
      });
    } else {
      this.httpOptions = this.getHeader(tokenType);
      this.http.get(url, this.httpOptions)
        .subscribe((res: Response) => {
          successFxn(res.json());
        }, error => {
          errorFxn(this.handleError(error));
        });
    }
  }

  public put(endpoint: string, data: object, tokenType: TokenType, successFxn: Function,
    errorFxn:Function) {

    const url = this.ROOT_URL + endpoint;
    if (!navigator.onLine) {
      errorFxn({
        error: 'Timeout',
        message: 'Unable to access server'
      });
    } else {
      this.httpOptions = this.getHeader(tokenType);
      this.http.put(url, data, this.httpOptions)
        .subscribe((res: Response) => {
          successFxn(res.json());
        }, error => {
          errorFxn(this.handleError(error.json()));
        });
    }
  }

  public delete(endpoint: string, tokenType: TokenType, successFxn: Function,
    errorFxn:Function) {

    const url = this.ROOT_URL + endpoint;
    if (!navigator.onLine) {
      errorFxn({
        error: 'Timeout',
        message: 'Unable to access server'
      });
    } else {
      this.httpOptions = this.getHeader(tokenType);
      this.http.delete(url, this.httpOptions)
        .subscribe((res: Response) => {
          successFxn(res.json());
        }, error => {
          errorFxn(this.handleError(error.json()));
        });
    }
  }

  private handleError (error) {
    if (error.name == 'TimeoutError') {
      return {
        error: 'Timeout',
        message: 'Server timed out'
      };
    } else if (error.error) {
      if (error.error == 'invalid_grant') {
        return {
          error: 'invalid grant',
          message: 'Incorrect username or password'
        };
      } else if (error.error == 'invalid_token') {
        this.router.navigate(['login']);
        return {
          error: 'Session expired',
          message: 'Session expired'
        };
      }
    } else if (error.error == undefined || error.error == null){
      return {
        error: 'Error',
        message: 'Server is not available at the moment'
      };
    }
    console.log(error)
    return {
      error: error.error,
      message: error.error_description ? error.error_description: error.error
    };
  }

  resetAccessToken ( ) {
    var token = Token.getInstance();
    var authUrl = `/oauth/token?grant_type=refresh_token&refresh_token=${token.getRefreshToken()}`;
    this.post(authUrl, {}, TokenType.BASIC, (data) => {
      console.log("Updated acess_token");
      token.updateAccessToken(data.access_token, <number> (new Date().getTime() / 1000) ,data.expires_in);
      localStorage.setItem('token', JSON.stringify(token));
    }, (error) => {
        console.log('Update access_token error');
    } );
  }

  private getToken(): Token{
    var token = Token.getInstance();
    if ( token.getRefreshToken() == null || token.getAccessToken() === null) {
      this.router.navigate(['/login']);
    } else if (token.isExpired() == true) {
      console.log('token expired')
      this.resetAccessToken();
      console.log(Token.getInstance)
      return Token.getInstance();
    }
    return token;
  }

}

export enum TokenType {
  BASIC = 1 ,
  BEARER = 2
}