import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private apiService: ApiService
  ) { }

  /**
   * The function redicects the user to the specified page
   * @param page - name of the page to redirect as string
   * @param extras - additional data to be passed with the redirect
   */
  async initDataLoading(page: String, extras?: any){
    if (page == "pgm"){
      await this.apiService.getPgmMask()
    }
    console.log("Page Transition: "+page+ " finished.")
  }
}
