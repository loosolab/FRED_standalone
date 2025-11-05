import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  sanitizedUrl: any;
  constructor(
    public apiService: ApiService,
    private sanitizer: DomSanitizer,
  ) {
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://loosolab.pages.gwdg.de/container/bcu-documentation/angular_interface/pgm',
    );
  }

  ngOnInit(): void {}
  openHelp() {
    window.open(
      'https://loosolab.pages.gwdg.de/container/bcu-documentation/new_project/fill_metadata.html',
    );
  }
  test() {
    this.apiService.getPgmMask();
  }
}
