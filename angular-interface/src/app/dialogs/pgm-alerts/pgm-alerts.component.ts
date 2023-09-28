import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pgm-alerts',
  templateUrl: './pgm-alerts.component.html',
  styleUrls: ['./pgm-alerts.component.scss']
})
export class PgmAlertsComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

}