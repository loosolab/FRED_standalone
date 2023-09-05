import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiURL: String

  constructor(
    private http: HttpClient
  ) { 
    this.apiURL = "http://localhost:5000"
  }

  testRequest() {
    return new Promise(resolve => {
      this.http.get(this.apiURL + "/test").pipe().subscribe((data: any) => {
        console.log(data)
        resolve("")
      })
    })
  }

}
