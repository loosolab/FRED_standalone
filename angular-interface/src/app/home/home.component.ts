import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  constructor(
    public apiService: ApiService
    ){
    
  }

  ngOnInit(): void {
  }
  openHelp(){
    window.open("https://loosolab.pages.gwdg.de/container/bcu-documentation/introduction_overview/")
  }
  test(){
    this.apiService.testRequest()
  }
}
