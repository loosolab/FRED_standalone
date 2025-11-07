import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-edit-fred-config',
  standalone: false,
  templateUrl: './edit-fred-config.component.html',
  styleUrl: './edit-fred-config.component.scss',
})
export class EditFredConfigComponent implements OnInit {
  public fred_config: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
  ) {
    this.fred_config = data.fred_config;
    console.log('fred config data:', this.fred_config);
  }
  ngOnInit(): void {}

  applyFredConfig() {
    console.log('Applying FRED config:', this.fred_config);
    this.apiService.updateFredConfig(this.fred_config).then(() => {
      console.log('FRED config updated successfully.');
    });
  }
}
