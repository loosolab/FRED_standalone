import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { LoadingComponent } from '../dialogs/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


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

  autofill_filter_list = []

  constructor(
    /*private dialog: MatDialog,
    public navService: NavigationService,
    public apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router*/
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public apiService: ApiService,
    private navService: NavigationService

  ) {
  
      this.navService.initDataLoading("pgm").then(() => {
        this.original_exp_setting = JSON.parse(JSON.stringify(this.apiService.empty_pgmMask.value.experimental_setting.input_fields))
        this.waiting_for_data = false
      })
    

  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    //WORKAROUND EXPANDED FLICKER
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => this.disableAnimation = false);
  }

  openHelpDialog(){
    /*const dialogRef = this.dialog.open(PgmHelpComponent, {
      hasBackdrop: true,
      width: "50%",
      height: "50%",
      data: {
        help_url: ""
      }
    })*/
  }

  selectionChange(event) {
    console.log(event)
    if (event.selectedIndex == 3) {
      this.validateObject(true)
    } else if (event.selectedIndex != 3 && event.previouslySelectedIndex != 3) {
      this.validateObject(false)
    }
  }

  validateObject(withSummary: boolean) {
    //console.log("Finished Mask: ", this.apiService.empty_pgmMask.value)
    this.loading_validation = true
    const loadingRef = this.dialog.open(LoadingComponent, {
      disableClose: true
    })
    this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:setting_id")[0].value = "exp"+ String(this.getExpSettingID())
    if (!withSummary) {
      this.apiService.validateObject(this.apiService.empty_pgmMask.value, this.all_factors).then((res: any) => {
        this.object_errors = res.errors
        this.summed_errors = this.object_errors.project.length + this.object_errors.experimental_setting.length + this.object_errors.technical_details.length
        this.object_warnings = res.warnings
        this.summed_warnings = this.object_warnings.project.length + this.object_warnings.experimental_setting.length + this.object_warnings.technical_details.length
        this.was_validated = true
        this.loading_validation = false
        loadingRef.close()
      })
    } else if (withSummary) {
      Promise.all([this.apiService.validateObject(this.apiService.empty_pgmMask.value, this.all_factors), this.apiService.validateObjectWithSummary(this.apiService.empty_pgmMask.value, this.all_factors)]).then((all_res: Array<any>) => {
        console.log("All Promise", all_res)
        var error_warning_res = all_res[0]
        var summary_res = all_res[1]
        this.object_summary = summary_res
        this.object_errors = error_warning_res.errors
        this.summed_errors = this.object_errors.project.length + this.object_errors.experimental_setting.length + this.object_errors.technical_details.length
        this.object_warnings = error_warning_res.warnings
        this.summed_warnings = this.object_warnings.project.length + this.object_warnings.experimental_setting.length + this.object_warnings.technical_details.length
        this.was_validated = true
        this.loading_validation = false
        loadingRef.close()
      })
    }
  }

  getExpSettingID(){
    var exp_setting_list = this.apiService.empty_pgmMask.value.experimental_setting.list_value
    var exp_setting_max_num = 0
    for (let exp_setting of exp_setting_list){
      var exp_setting_id = exp_setting.filter(e => e.position == "experimental_setting:setting_id")[0].value
      if (exp_setting_id){
        exp_setting_max_num = Number(exp_setting_id.substring(3))
        console.log("ID", exp_setting_id, "Number", exp_setting_max_num)
      }
    }
    console.log("myexp", exp_setting_max_num+1)
    return exp_setting_max_num +1
  }

  applyRestrictedShortText(input_event, regex_string, max_length, field){
    const input = input_event.target.value;
    const regex = new RegExp(regex_string, "g")
    const sanitizedInput = input.replace(regex, '').slice(0,max_length);
    input_event.target.value = sanitizedInput;
    field.value = sanitizedInput
  }

  applySearchFilter(search_str: string, search_info: any) {
    console.log("Search string:", search_str)
    this.apiService.searchWhitelistElements(search_str, 25, search_info).then((res: any) => {
        this.autofill_filter_list = res
        return
    })
  }
  
  selectSomeValues(value, element) {
    console.log("select value", value)
    element.list_value.push(value)
    this.autofill_filter_list = []
    console.log("selected element", element)
  }
  
  
  unselectValue(vlaue, element) {
    const index = element.list_value.indexOf(vlaue)
    element.list_value.splice(index, 1)
  }

  addDisabledToGenericList(element) {
    if (element.value != "" && element.value != null) {
      return false
    } else {
      return true
    }
  }

  addToGenericList(element) {
    element.list_value.push(JSON.parse(JSON.stringify(element.value)))
    element.value = ""
    console.log(element)
  }
  deleteFromGenericList(element, list_item) {
    element.list_value.splice(element.list_value.indexOf(list_item), 1)
    console.log(element)
  }

  editGenericExpandable(element, list_item) {
    element.input_fields = JSON.parse(JSON.stringify(list_item))
    element.list_value.splice(element.list_value.indexOf(list_item), 1)
}

deleteFromGenericExpandable(element, list_item) {
  element.list_value.splice(element.list_value.indexOf(list_item), 1)
  console.log(element)
}

deleteDisabledFromGenericExpandable(element) {
    var input_disabled_ls = []
    element.forEach(element => {
        input_disabled_ls.push(element.input_disabled)
    })
    if (input_disabled_ls.includes(true)) {
        return true
    } else {
        return false
    }
}

  addDisabledToGenericExpandable(element) {
    var filled_out_ls = []
    element.input_fields.forEach(field => {
      
        if (field.mandatory) {
          if (field.input_type == "value_unit") {
            if (field.value && field.value_unit) {
              filled_out_ls.push(true)
          } else {
              filled_out_ls.push(false)
          }
        }else if (field.list || field.input_type == "single_autofill"){
            if (field.list_value.length > 0){
              filled_out_ls.push(true)
            } else {
              filled_out_ls.push(false)
            }
          }else {
              if (field.value) {
                  filled_out_ls.push(true)
              } else {
                  filled_out_ls.push(false)
              }
          }  
        }
    })
    if (filled_out_ls.includes(false)) {
        return true
    } else {
        return false
    }
}
addToGenericExpandable(element) {
  console.log(element)
  var used_unique_values = []
  var unique_field: any
  var value_to_check = ""
  
  if (element.ident_key) {
      //ident_key block

      unique_field = element.input_fields.filter(input => input.position == element.ident_key)[0]
      console.log(unique_field)
      if (unique_field.value) {
          element.list_value.forEach(input_element => {
              used_unique_values.push(input_element.filter(input => input.position == element.ident_key)[0].value)
          })
          value_to_check = unique_field.value
      } else if (unique_field.list_value) {

          element.list_value.forEach(input_element => {
              used_unique_values.push(input_element.filter(input => input.position == element.ident_key)[0].list_value.sort((a, b) => b.localeCompare(a)).join(','))
          })
          value_to_check = unique_field.list_value.sort((a, b) => b.localeCompare(a)).join(',')

      }
      console.log(value_to_check)
      console.log(used_unique_values)
  }

  if (used_unique_values.includes(value_to_check)) {
      console.log("already added")
      this.openSnackBar("This value is already added. Please edit or delete the value below.")
  } else {
      console.log("new one")
      element.list_value.push(JSON.parse(JSON.stringify(element.input_fields)))
      element.input_fields.forEach(field => {
          field.value = null
          if (field.list_value) {
              field.list_value = []
          }

          field.input_disabled = false

      })
  }
}

openSnackBar(message) {
  this.snackBar.open(message, "", {
    duration: 5000,
    panelClass: ["warning-snackbar"]
  })
}

}
