import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { EditFredConfigComponent } from '../dialogs/edit-fred-config/edit-fred-config.component';

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
    private dialog: MatDialog,
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

  openFredConfigure() {
    this.apiService.getFredConfig().then((fred_config) => {
      const dialogRef = this.dialog.open(EditFredConfigComponent, {
        data: { fred_config: fred_config },
        minWidth: '70vh',
        hasBackdrop: true,
      });
    });
  }
}
