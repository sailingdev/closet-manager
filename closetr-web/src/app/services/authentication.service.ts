import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  baseUrl: string;
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.baseUrl}/users/login`;
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(loginData: any) {
    var params = {
      user: loginData
    };
    var currUser;

    return this.http.post<any>(this.baseUrl, params)
      .pipe(map(user => {
          if (user && user.token) {
            currUser = new User(user.data);
            localStorage.setItem('currentUser', JSON.stringify(currUser));
            this.currentUserSubject.next(currUser);
            return currUser;
          } else {
            return false;
          }
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

}
