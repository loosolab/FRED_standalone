import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiURL: String
  public empty_pgmMask = new BehaviorSubject(null)


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

  /**
   * Returns a promise that is resolved when the input mask for the Metadata Generator is received from the API
   * Updates the value of the Project Generator Metadata behavior subject.
   * 
   * @returns a promise with resloves when the input mask is received
   */
  getPgmMask() {
    return new Promise((resolve => {
      this.http.get(this.apiURL + "/getPgmMask").pipe().subscribe((res: any) => {
        console.log(res)
        this.empty_pgmMask.next(res)
        resolve("")
      })
    }))
  }


}
