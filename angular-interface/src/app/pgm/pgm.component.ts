import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { LoadingComponent } from '../dialogs/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PgmAlertsComponent } from '../dialogs/pgm-alerts/pgm-alerts.component';
import { PgmEditFactorsComponent } from '../dialogs/pgm-edit-factors/pgm-edit-factors.component';
import { PgmEditConditionComponent } from '../dialogs/pgm-edit-condition/pgm-edit-condition.component';
import { PgmHelpComponent } from '../dialogs/pgm-help/pgm-help.component';
import { MatPaginator } from '@angular/material/paginator';


@Component({
    selector: 'app-pgm',
    templateUrl: './pgm.component.html',
    styleUrls: ['./pgm.component.scss'],
    standalone: false
})
export class PgmComponent implements OnInit {
  @ViewChild('condition_paginator') condition_paginator: MatPaginator
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
  object_errors = { project: [], experimental_setting: [], technical_details: [], summed: 0 }
  object_warnings = { project: [], experimental_setting: [], technical_details: [], summed: 0 }
  organism_name = ""
  condition_whitelists = {}
  organism_was_selected = false
  was_validated = false
  loading_validation = true
  waiting_for_data = true
  condition_filter_str = ""
  filterPanelOpenState = false
  chip_conditions = []
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

  displayedChips = this.chip_conditions.slice(0, 10);
  styling_vars = { input_types: { std: "50", long_text: ["70", "30"] } }

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

  openHelpDialog() {
    const dialogRef = this.dialog.open(PgmHelpComponent, {
      hasBackdrop: true,
      width: "50%",
      height: "50%",
      data: {
        help_url: ""
      }
    })
  }
  openSnackBar(message) {
    this.snackBar.open(message, "", {
      duration: 5000,
      panelClass: ["warning-snackbar"]
    })
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
    this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:setting_id")[0].value = "exp" + String(this.getExpSettingID())
    if (!withSummary) {
      this.apiService.validateObject(this.apiService.empty_pgmMask.value, this.all_factors).then((res: any) => {
        this.object_errors = res.errors
        this.object_errors.summed = this.object_errors.project.length + this.object_errors.experimental_setting.length + this.object_errors.technical_details.length
        this.object_warnings = res.warnings
        this.object_warnings.summed = this.object_warnings.project.length + this.object_warnings.experimental_setting.length + this.object_warnings.technical_details.length
        this.was_validated = true
        this.loading_validation = false
        loadingRef.close()
      })
    } else if (withSummary) {
      Promise.all([this.apiService.validateObject(this.apiService.empty_pgmMask.value, this.all_factors, true), this.apiService.validateObjectWithSummary(this.apiService.empty_pgmMask.value, this.all_factors)]).then((all_res: Array<any>) => {
        console.log("All Promise", all_res)
        var error_warning_res = all_res[0]
        var summary_res = all_res[1]
        this.object_summary = summary_res
        this.object_errors = error_warning_res.errors
        this.object_errors.summed = this.object_errors.project.length + this.object_errors.experimental_setting.length + this.object_errors.technical_details.length
        this.object_warnings = error_warning_res.warnings
        this.object_warnings.summed = this.object_warnings.project.length + this.object_warnings.experimental_setting.length + this.object_warnings.technical_details.length
        this.was_validated = true
        this.loading_validation = false
        loadingRef.close()
      })
    }
  }

  getExpSettingID() {
    var exp_setting_list = this.apiService.empty_pgmMask.value.experimental_setting.list_value
    var exp_setting_max_num = 0
    for (let exp_setting of exp_setting_list) {
      var exp_setting_id = exp_setting.filter(e => e.position == "experimental_setting:setting_id")[0].value
      if (exp_setting_id) {
        exp_setting_max_num = Number(exp_setting_id.substring(3))
        console.log("ID", exp_setting_id, "Number", exp_setting_max_num)
      }
    }
    console.log("myexp", exp_setting_max_num + 1)
    return exp_setting_max_num + 1
  }

  applyRestrictedShortText(input_event, regex_string, max_length, field) {
    const input = input_event.target.value;
    const regex = new RegExp(regex_string, "g")
    const sanitizedInput = input.replace(regex, '').slice(0, max_length);
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
        } else if (field.list || field.input_type == "single_autofill") {
          if (field.list_value.length > 0) {
            filled_out_ls.push(true)
          } else {
            filled_out_ls.push(false)
          }
        } else {
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

  setOrganismDisabled(organism_name) {
    if (organism_name && this.organism_was_selected == false) {
      return false
    } else {
      return true
    }
  }

  clearOrganismDisabled() {
    if (this.organism_was_selected == true) {
      return false
    } else {
      return true
    }
  }

  setOrganismName(organism_name) {
    this.organism_name = organism_name
    this.organism_was_selected = true
  }

  clearOrganismName(element) {
    console.log("WARNING All will deleted")
    const dialogRef = this.dialog.open(PgmAlertsComponent, {
      hasBackdrop: true,
      data: { title: "Clear Organism", message: "Are you sure you want to reset the organism and reset your current input?" }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organism_name = ""
        element.value = ""
        this.organism_was_selected = false
        this.factors = []
        this.organism_name = ""
        //this.del_conditions = []
        this.conditions = []
        this.chip_conditions = []
        this.filterPanelAllowed = false
        this.filterPanelOpenState = false
        this.displayedChips = this.chip_conditions.slice(0, 10);
        this.update_selected_conditions()
        this.resetFilterChipConds()
        this.apiService.empty_pgmMask.value.experimental_setting.input_fields = JSON.parse(JSON.stringify(this.original_exp_setting))
      }
    })
  }
  update_selected_conditions() {
    this.selected_conditions = this.conditions.filter(cond => cond.selected == true)
    console.log("sel conds", this.selected_conditions)
  }
  resetFilterChipConds() {
    this.selected_filter_factor_object = [
      {
        selected_filter_factor: {},
        selected_filter_factor_values: []
      },
      {
        selected_filter_factor: {},
        selected_filter_factor_values: []
      }
    ]
    this.filterUnselectedChips = false
    this.filterSelectedChips = false
    this.condition_filter_str = ""
    this.filterChipConditions()
  }

  chipSelectionChange(event: any, cond) {
    cond.selected = event.selected
    this.filterChipConditions()
    this.update_selected_conditions()
    //if event false --> unselect
  }
  selectAllChipConds() {
    this.chip_conditions.map(v => v.selected = true)
    this.filterChipConditions()
    this.update_selected_conditions()

  }
  unselectAllChipConds() {
    this.chip_conditions.map(v => v.selected = false)
    this.filterChipConditions()
    this.update_selected_conditions()

  }
  filterUnseleced() {
    if (this.filterUnselectedChips) {
      this.filterSelectedChips = false
    }
    this.filterChipConditions()
  }
  filterSeleced() {
    if (this.filterSelectedChips) {
      this.filterUnselectedChips = false
    }
    this.filterChipConditions()
  }

  filterChipConditions() {

    var filter_data = this.conditions
    if (this.filterSelectedChips) {
      filter_data = filter_data.filter(cond => cond.selected == true)
    }
    if (this.filterUnselectedChips) {
      filter_data = filter_data.filter(cond => cond.selected == false)
    }
    console.log(filter_data)
    this.selected_filter_factor_object.forEach((filter_object: any) => {

      if (filter_object.selected_filter_factor) {
        filter_object.selected_filter_factor_values.forEach(filter_factor_value => {
          filter_data = filter_data.filter(cond =>
            cond.search.includes(
              filter_object.selected_filter_factor.factor.toLowerCase().trim()
              + ':"' + filter_factor_value.toLowerCase().trim() + '"')
          )
          console.log(filter_object.selected_filter_factor.factor.toLowerCase().trim()
            + ':"' + filter_factor_value.toLowerCase().trim() + '"')
        })
      }
    })

    //filter for filter string

    filter_data = filter_data.filter(cond =>
      cond.search.some(search_element =>
        search_element.includes(
          this.condition_filter_str.toLowerCase().trim()
        )
      )
    )
    console.log("after filter", filter_data)
    this.chip_conditions = filter_data
    this.onPageChange(this.condition_paginator)

  }

  onPageChange(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.displayedChips = this.chip_conditions.slice(startIndex, endIndex);
  }
  openFactorsDialogAllowed() {
    if (this.organism_name) {
      this.openFactorsDialog()
    } else {
      this.openSnackBar("Please confirm the organism first.")
    }
  }

  openFactorsDialog() {
    const dialogRef = this.dialog.open(PgmAlertsComponent, {
      hasBackdrop: true,
      data: { title: "Edit factors and generate conditions", message: "Are you sure you want to edit the facors? This will reset your current input for the conditions." }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const loadingRef = this.dialog.open(LoadingComponent, {
          disableClose: true
        })
        this.apiService.getFactors(this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:organism")[0].value).then((data_res: any) => {
          loadingRef.close()
          const dialogRef = this.dialog.open(PgmEditFactorsComponent, {
            hasBackdrop: true,
            disableClose: true,

            minWidth: "40%",
            width: "40%",
            data: {
              factors: data_res.factor,
              values: data_res.values,
              desc: data_res.desc
            }
            //organism_name: this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:organism")[0].value

          })
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log("factors RESULT", result)
              Object.assign(result, { organism_name: this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:organism")[0].value })
              this.conditions = []
              const loadingRef = this.dialog.open(LoadingComponent, {
                disableClose: true
              })
              this.factors = JSON.parse(JSON.stringify(result.factor_list))
              this.apiService.getConditions(result).then((res_conditions: any) => {
                console.log("factors?", this.factors)
                this.conditions = JSON.parse(JSON.stringify(res_conditions.conditions))

                // thiis goes to filter function
                //this.del_conditions = []
                this.condition_whitelists[res_conditions.organism] = JSON.parse(JSON.stringify(res_conditions.whitelist_object))
                console.log("whitelist test", this.condition_whitelists)
                console.log("All conditions", this.conditions)

                this.chip_conditions = this.conditions.map(v => Object.assign(v, { selected: false }))
                this.filterPanelAllowed = true
                this.filterPanelOpenState = true
                this.update_selected_conditions()
                this.resetFilterChipConds()
                loadingRef.close()
              })
            }
          })
        })
      }
    })
  }

  getFilterFactorValues(filter_object) {

    //filer_factor_values = this.factors.filter(filter_factor => filter_factor.factor == this.selected_filter_factor)
    //console.log("getFilterFactorValues", this.selected_filter_factor,filer_factor_values)
    if (filter_object.selected_filter_factor.values) {
      if (typeof filter_object.selected_filter_factor.values[0] == 'object') {
        var nested_vales_return = []
        Object.entries(filter_object.selected_filter_factor.values[0]).forEach(([nested_factor, nested_value]) => {
          if (typeof nested_value != 'boolean') {
            nested_vales_return = nested_vales_return.concat(nested_value)
          }
        })
        return nested_vales_return
      } else {
        return filter_object.selected_filter_factor.values
      }
    } else {
      return []
    }
  }

  editCondition(condition, organism_name) {
    const dialogRef = this.dialog.open(PgmEditConditionComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "80%",
      data: { condition: condition, whitelist: this.condition_whitelists[organism_name] }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("sample ls", result)
        condition.list_value = result
        console.log(condition)
        console.log(this.conditions)
      }
    })
  }

  editFinishedCondition(condition, setting) {
    console.log("edit Finished", condition, setting)
    var organism_name_to_edit = ""
    setting.forEach(category => {
      if (category.position == "experimental_setting:organism") {
        organism_name_to_edit = category.value
      }
    })
    this.editCondition(condition, organism_name_to_edit)
  }

  checkEnteredSamples() {
    var sample_counts = this.selected_conditions.map(condition => condition.list_value.length)
    console.log("sample_counts", sample_counts)
    if (!sample_counts.includes(0)) {
      return true
    } else {
      console.log("false")
      return false
    }
  }

  addExperimentalSettingDialogs() {

    const dialogRef = this.dialog.open(PgmAlertsComponent, {
      hasBackdrop: true,
      data: {
        title: "Add Experimental Setting",
        message: "Are you sure you want to add the experimental setting? You will only be able to add more samples in the given conditions.",
      }
    })
    dialogRef.afterClosed().subscribe(result => {


      if (result) {
        //add_setting_allowed = this.checkEnteredSamples()
        console.log("add_setting_allowed 1", this.checkEnteredSamples())
        if (!this.checkEnteredSamples()) {
          const seconddialogRef = this.dialog.open(PgmAlertsComponent, {
            hasBackdrop: true,
            data: {
              title: "Missing Samples!",
              message: "Please be aware that not all conditions have associated samples. Would you like to proceed and save this experimental setting regardless?"
            }
          })
          seconddialogRef.afterClosed().subscribe(no_sample_result => {
            if (no_sample_result) {
              this.addExperimantalSetting()
            }
          })
        } else {
          this.addExperimantalSetting()
        }


      }
    })
  }

  addExperimantalSetting() {
    //add conditions
    //this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:experimental_factors")[0].list_value = JSON.parse(JSON.stringify(this.factors))
    //this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:setting_id")[0] = 
    this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:conditions")[0].list_value = JSON.parse(JSON.stringify(this.selected_conditions))
    this.apiService.empty_pgmMask.value.experimental_setting.list_value.push(JSON.parse(JSON.stringify(this.apiService.empty_pgmMask.value.experimental_setting.input_fields)))
    this.apiService.empty_pgmMask.value.experimental_setting.input_fields = JSON.parse(JSON.stringify(this.original_exp_setting))
    this.all_factors.push(this.factors)
    this.apiService.empty_pgmMask.value.all_factors.push(this.factors)
    console.log("all factors", this.all_factors)
    this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:setting_id")[0].value = "exp" + String(this.getExpSettingID())
    this.conditions = []
    this.selected_conditions = []
    this.factors = []
    this.organism_name = ""
    //this.del_conditions = []
    this.organism_was_selected = false
    console.log(this.original_exp_setting)
    console.log(this.apiService.empty_pgmMask.value)
    this.resetFilterChipConds()
  }
  removeExperimentalSetting(setting) {
    this.apiService.empty_pgmMask.value.experimental_setting.list_value.splice(this.apiService.empty_pgmMask.value.experimental_setting.list_value.indexOf(setting), 1)
    this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:setting_id")[0].value = "exp" + String(this.getExpSettingID())
  }

  addExperimentalSettingDisabled() {
    //change to multiple checks
    if (this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:organism")[0].value != null
      && this.apiService.empty_pgmMask.value.experimental_setting.input_fields.filter(e => e.position == "experimental_setting:organism")[0].value != ""
      && this.selected_conditions.length > 0
      && this.factors.length > 0) {
      return false
    } else {
      return true
    }
  }

  finishDisabled() {
    if (this.was_validated && this.object_errors.summed == 0) {
      return false
    } else {
      return true
    }
  }

  requiredFieldFilledOut() {
    var fieldsFilled_project = []
    this.apiService.empty_pgmMask.value.project.input_fields.forEach(element => {
      if (element.mandatory) {
        if (element.input_fields) {
          element.input_fields.forEach(inner_element => {
            if (inner_element.mandatory) {
              if (inner_element.value) {
                fieldsFilled_project.push(true)
              } else {
                fieldsFilled_project.push(false)
              }
            }
          })
        } else {
          if (element.mandatory) {
            if (element.value) {
              fieldsFilled_project.push(true)
            } else {
              fieldsFilled_project.push(false)
            }
          }
        }
      }
    })

    var fieldsFilled_experiment = []
    var exp_setting_elements = this.apiService.empty_pgmMask.value.experimental_setting.list_value
    if (this.apiService.empty_pgmMask.value.experimental_setting.list_value.length > 0) {

      fieldsFilled_experiment.push(true)
    } else {
      fieldsFilled_experiment.push(false)
    }

    var fieldsFilled_techDetails = []
    var technique_elemts = this.apiService.empty_pgmMask.value.technical_details.input_fields.filter(e => e.position == "technical_details:techniques")[0].list_value
    console.log("technique_elemts", technique_elemts.length, "exp_setting_elements", exp_setting_elements.length)
    if (technique_elemts.length != 0 && technique_elemts.length >= exp_setting_elements.length) {
      fieldsFilled_techDetails.push(true)
    } else {
      fieldsFilled_techDetails.push(false)
    }

    return [!fieldsFilled_project.includes(false), !fieldsFilled_experiment.includes(false), !fieldsFilled_techDetails.includes(false)]
  }

  finishMetadataInput() {
    var filledOutField_return = this.requiredFieldFilledOut()
    if (!filledOutField_return.includes(false)) {
      const dialogRef = this.dialog.open(PgmAlertsComponent, {
        hasBackdrop: true,
        data: { title: "Finish Metadate Input", message: "Are you sure you want to finish your Input? It can not be edited until your project appears under the 'Self Deployment Omics Analysis' Part of this Website." }
      })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const loadingRef = this.dialog.open(LoadingComponent, {
            disableClose: true
          })
          this.apiService.finishMetadata(this.apiService.empty_pgmMask.value, this.all_factors).then((res: any) => {

            this.inputSaved = true
            loadingRef.close()
          })
        }
      })
    } else {
      var missing_part = []
      filledOutField_return.forEach((part, index) => {
        if (!part) {
          if (index == 0) {
            missing_part.push("'Details about Project'")
          } else if (index == 1) {
            missing_part.push("'Details about Experimental Setting'")
          } else if (index == 2) {
            missing_part.push("'Technical Details Project'")
          }
        }
      })
      this.openSnackBar("Not all required fields are filled out. Please check your input at " + missing_part.join(", "))
    }

  }

  downloadFileList(file_string) {
    const loadingRef = this.dialog.open(LoadingComponent, {
      disableClose: true
    })
    this.apiService.downloadFileList(file_string)
    loadingRef.close()
  }

  openSpecificExpandables(element_position) {
    var expaned = false
    if (element_position == "experimental_setting:experimental_factors" && this.organism_was_selected) {
      expaned = true
    } else if (element_position == "experimental_setting:conditions" && this.selected_conditions.length > 0) {
      expaned = true
    }
    return expaned
  }
}
