import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pgm-help',
  templateUrl: './pgm-help.component.html',
  styleUrls: ['./pgm-help.component.scss'],
  standalone: false,
})
export class PgmHelpComponent implements OnInit {
  sanitizedUrl: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
  ) {
    this.data.help_url =
      'https://loosolab.pages.gwdg.de/software/metadata-organizer/';
    // Assuming url is the dynamic URL you want to bind
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.data.help_url,
    );
  }

  ngOnInit(): void {}

  openHelp() {
    window.open('https://loosolab.pages.gwdg.de/software/metadata-organizer/');
  }
}
