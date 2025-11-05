import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { PgmComponent } from './pgm/pgm.component';
import { LoadingComponent } from './dialogs/loading/loading.component';
import { PgmAlertsComponent } from './dialogs/pgm-alerts/pgm-alerts.component';
import { PgmEditFactorsComponent } from './dialogs/pgm-edit-factors/pgm-edit-factors.component';
import { PgmEditConditionComponent } from './dialogs/pgm-edit-condition/pgm-edit-condition.component';
import { PgmHelpComponent } from './dialogs/pgm-help/pgm-help.component';
import { SnackbarMessageComponent } from './dialogs/snackbar-message/snackbar-message.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PgmComponent,
    LoadingComponent,
    PgmAlertsComponent,
    PgmEditFactorsComponent,
    PgmEditConditionComponent,
    PgmHelpComponent,
    SnackbarMessageComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    //Mat Imports
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatRippleModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
    MatPaginatorModule,
    MatBadgeModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
