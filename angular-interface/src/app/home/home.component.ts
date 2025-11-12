import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { EditFredConfigComponent } from '../dialogs/edit-fred-config/edit-fred-config.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarMessageComponent } from '../dialogs/snackbar-message/snackbar-message.component';
import { LoadingComponent } from '../dialogs/loading/loading.component';
import { PgmHelpComponent } from '../dialogs/pgm-help/pgm-help.component';

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
    private snackBar: MatSnackBar,
  ) {
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://loosolab.pages.gwdg.de/container/bcu-documentation/angular_interface/pgm',
    );
  }

  ngOnInit(): void {}
  openHelpDialog() {
    const dialogRef = this.dialog.open(PgmHelpComponent, {
      hasBackdrop: true,
      minWidth: '70vw',
      height: '70%',
      data: {
        help_url: '',
      },
    });
  }
  test() {
    this.apiService.getPgmMask();
  }

  openFredConfigure() {
    const loadingRef = this.dialog.open(LoadingComponent, {
      disableClose: true,
    });
    this.apiService.getFredConfig().then((fred_config) => {
      loadingRef.close();
      const dialogRef = this.dialog.open(EditFredConfigComponent, {
        data: { fred_config: fred_config },
        minWidth: '70vh',
        hasBackdrop: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const loadingRef = this.dialog.open(LoadingComponent, {
            disableClose: true,
          });
          console.log('Dialog result:', result);
          this.apiService.updateFredConfig(result).then(() => {
            console.log('FRED config updated successfully.');
            loadingRef.close();
            this.openSnackBar('', 'FRED config updated.', '', undefined, 4000);
          });
        }
      });
    });
  }

  openSnackBar(
    title: string,
    message: string,
    type: string,
    confirmation_text?: string,
    duration?: number,
  ) {
    var snackbar_config = {
      data: { title: title, message: message, type: type },
    };
    if (confirmation_text) {
      snackbar_config.data['confirmation_text'] = confirmation_text;
    } else {
      snackbar_config['duration'] = duration;
    }
    console.log(snackbar_config);
    this.snackBar.openFromComponent(SnackbarMessageComponent, snackbar_config);
  }
}
