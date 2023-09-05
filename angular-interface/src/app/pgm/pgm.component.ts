import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';


@Component({
  selector: 'app-pgm',
  templateUrl: './pgm.component.html',
  styleUrls: ['./pgm.component.scss']
})
export class PgmComponent implements OnInit {

  @HostListener("window:beforeunload")
  canDeactivate(): boolean | Observable<boolean> {
    return this.inputSaved;
  }

  inputSaved = false;

  disableAnimation = true;
  conditions = []
  selected_conditions = []
  factors = []
  all_factors = []
  //del_conditions = []
  original_exp_setting: any
  owner_exists = false;
  copyValue = ""
  object_summary: any
  object_errors = { project: [], experimental_setting: [], technical_details: [] }
  summed_errors = 0
  object_warnings = { project: [], experimental_setting: [], technical_details: [] }
  summed_warnings = 0
  organism_name = ""
  condition_whitelists = {}
  organism_was_selected = false
  was_validated = false
  loading_validation = true
  waiting_for_data = true
  edit_mode = false
  condition_filter_str = ""
  filterPanelOpenState = false
  chip_conditions: any
  filterUnselectedChips = false
  filterSelectedChips = false
  filterPanelAllowed = false
  selected_filter_factor_object = [
    {
      selected_filter_factor: {},
      selected_filter_factor_values: []
    },
    {
      selected_filter_factor: {},
      selected_filter_factor_values: []
    }
  ]

  constructor(
    /*private dialog: MatDialog,
    public navService: NavigationService,
    public apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router*/
    private router: Router,
    public apiService: ApiService,
    private navService: NavigationService

  ) {
    console.log("query", this.router.getCurrentNavigation().extras.state)
    if (!this.router.getCurrentNavigation().extras.state) {
      this.navService.initDataLoading("pgm").then(() => {
        this.original_exp_setting = JSON.parse(JSON.stringify(this.apiService.empty_pgmMask.value.experimental_setting.input_fields))
        this.waiting_for_data = false
      })
    } else {
      this.navService.initDataLoading("pgm", this.router.getCurrentNavigation().extras.state).then(() => {
        this.original_exp_setting = JSON.parse(JSON.stringify(this.apiService.empty_pgmMask.value.experimental_setting.input_fields))
        this.condition_whitelists = JSON.parse(JSON.stringify(this.apiService.empty_pgmMask.value.whitelists))
        this.all_factors = JSON.parse(JSON.stringify(this.apiService.empty_pgmMask.value.all_factors))
        delete this.apiService.empty_pgmMask.value["whitelists"]
        this.owner_exists = true
        this.waiting_for_data = false
        this.edit_mode = true

      })
    }

  }


  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    //WORKAROUND EXPANDED FLICKER
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => this.disableAnimation = false);
  }

}
