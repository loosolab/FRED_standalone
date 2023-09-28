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

  /**
   * Returns a promise that resolves with an array containing the validated metadata object
   * @param data - the metadata object to be validated
   * @param factors - list of factors that are needed by the API
   * @returns a promise that resolves with an array containing the validated metadata
   */
  validateObject(data, factors) {
    return new Promise((resolve => {
      var post_obj = { object: data, factors: factors }
      console.log("Object to validate", post_obj)
      this.http.post(this.apiURL + "/validatePgm", post_obj).pipe().subscribe((res: any) => {
        console.log("validated object", res)
        console.log("validated object", res.object)
        this.empty_pgmMask.next(res.object)
        var new_res = res
        delete new_res["object"]
        console.log("only validate", new_res)
        console.log("Validation Step finished.")
        resolve(new_res)
      })
    }))
  }

   /**
   * Returns a promise that resolves with an object, containing an array with the validated metadata object and a summary in html
   * @param data - the metadata object to be validated
   * @param factors - list of factors that are needed by the API
   * @returns a promise that resolves with an object, containing an array with the validated metadata and a summary in html
   */
   validateObjectWithSummary(data, factors) {
    return new Promise((resolve => {
      var post_obj = { object: data, factors: factors }
      this.http.post(this.apiURL + "/validatePgmWithSummary", post_obj).pipe().subscribe((res: any) => {
        console.log("validated object", res)

        console.log("with summary", res)
        resolve(res)
      })
    }))
  }

  searchWhitelistElements(search_string, result_count, search_object) {
    return new Promise((resolve) => {
      var post_obj = { search_string: search_string, result_count: result_count, search_object: search_object }
      this.http.post(this.apiURL + "/searchWhitelist", post_obj).pipe().subscribe((res: any) => {
        console.log("Search res: ", res)
        resolve(res.search_results)
      })
    })
  }
}
