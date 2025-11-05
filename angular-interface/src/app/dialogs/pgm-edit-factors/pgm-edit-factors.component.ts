import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pgm-edit-factors',
  templateUrl: './pgm-edit-factors.component.html',
  styleUrls: ['./pgm-edit-factors.component.scss'],
  standalone: false,
})
export class PgmEditFactorsComponent implements OnInit {
  selected_factor: string;
  selected_value = [];
  factorList = [];
  factorColumns: string[];
  factor_table: any;
  selected_value_unit = { value: '', unit: '' };
  selected_value_nested = {};
  gene_list = [];

  original_data: any;

  filter_list: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
  ) {
    console.log(this.data);
    this.factorColumns = ['factor', 'value', 'actions'];
    /*this.gene_list = this.data.values.gene.whitelist
    this.gene_filtered_list = this.data.values.gene.whitelist.slice(0, 50)*/
    this.original_data = JSON.parse(JSON.stringify(this.data));
  }

  ngOnInit(): void {}

  applySearchFilter(search_str: string, search_info: any) {
    console.log('Search string:', search_str);
    this.apiService
      .searchWhitelistElements(search_str, 25, search_info)
      .then((res: any) => {
        this.filter_list = res.filter(
          (single_res) =>
            !this.selected_value.some((elem) => elem === single_res),
        );
        return;
      });
  }

  selectSomeValues(value) {
    console.log('select value', value);
    if (!this.selected_value.includes(value)) {
      this.selected_value.push(value);
    } else {
      this.openSnackBar('Value already added.');
    }

    this.filter_list = [];
    console.log(this.selected_value);
  }

  applyRestrictedShortText(input_event, regex_string, max_length) {
    const input = input_event.target.value;
    const regex = new RegExp(regex_string, 'g');
    const sanitizedInput = input.replace(regex, '').slice(0, max_length);
    input_event.target.value = sanitizedInput;
  }

  unselectValue(value) {
    const index = this.selected_value.indexOf(value);
    this.selected_value.splice(index, 1);
  }

  addFactorDisabled() {
    if (this.selected_factor) {
      if (this.data.values[this.selected_factor].input_type == 'value_unit') {
        if (
          this.selected_value_unit.unit != '' &&
          this.selected_value_unit.value != ''
        ) {
          return false;
        } else {
          return true;
        }
      } else if (
        this.data.values[this.selected_factor].input_type == 'nested'
      ) {
        //console.log(this.selected_factor, this.selected_value_nested)
        var filled_out_ls = [];
        this.data.values[this.selected_factor].whitelist.forEach((element) => {
          if (element.required) {
            //input types!
            if (
              element.input_type == 'select' ||
              element.input_type == 'group_select' ||
              element.input_type == 'value_unit'
            ) {
              if (this.selected_value_nested[element.position].length > 0) {
                filled_out_ls.push(true);
              } else {
                filled_out_ls.push(false);
              }
            }
          }
        });
        if (filled_out_ls.includes(false)) {
          return true;
        } else {
          return false;
        }
      } else {
        if (this.selected_value.length > 0) {
          return false;
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  addFactor() {
    console.log(this.selected_factor, this.selected_value);
    if (this.data.values[this.selected_factor].input_type == 'value_unit') {
      var value_list = this.selected_value_unit.value.split(',');
      value_list = value_list.filter((v) => v != '');
      //test if elemnt is number
      this.selected_value = value_list
        .filter((v) => !isNaN(Number(v)))
        .map((v) => v.trim() + this.selected_value_unit.unit);
      console.log(this.selected_value);
    }
    if (this.data.values[this.selected_factor].input_type == 'nested') {
      this.selected_value.push(this.selected_value_nested);
    }
    if (
      this.factorList.filter((v) => v.factor == this.selected_factor).length ==
      0
    ) {
      //if header -> { value: "", unit: "" , header: "" }
      var factor_element = {
        factor: this.selected_factor,
        values: this.selected_value,
      };
      if (this.data.values[this.selected_factor].headers) {
        Object.assign(factor_element, {
          headers: this.data.values[this.selected_factor].headers,
        });
      }
      if (this.data.values[this.selected_factor].whitelist_keys) {
        Object.assign(factor_element, {
          whitelist_keys: this.data.values[this.selected_factor].whitelist_keys,
        });
      }
      if (this.data.values[this.selected_factor].nested_infos) {
        Object.assign(factor_element, {
          nested_infos: this.data.values[this.selected_factor].nested_infos,
        });
      }
      this.factorList.push(factor_element);
      this.clearSelectedValue();
      this.selected_factor = undefined;
      this.data = JSON.parse(JSON.stringify(this.original_data));
      console.log(this.factorList);

      this.updateTableData();
    } else {
      this.openSnackBar(
        'Factor already added. If you want to edit the Factor, delete the one in the Table below.',
      );
    }
  }

  clearSelectedValue() {
    this.selected_value = [];
    this.selected_value_unit = { value: '', unit: '' };

    this.selected_value_nested = {};
  }

  nestedValuesSelect(element, input_value?) {
    console.log('hello', element);
    if (
      element.input_type == 'select' ||
      element.input_type == 'group_select'
    ) {
      this.selected_value_nested[element.position] = element.value;
    } else if (element.input_type == 'value_unit') {
      var value_list = element.value.split(',');
      value_list = value_list.filter((v) => v != '');
      this.selected_value_nested[element.position] = value_list
        .filter((v) => !isNaN(Number(v)))
        .map((v) => v + element.unit);
      console.log('Nested Value Select', element);
    } else if (element.input_type == 'multi_autofill') {
      this.selected_value_nested[element.position].push(input_value);
      this.filter_list = [];
      console.log(this.selected_value_nested);
    } else if (element.input_type == 'restricted_short_text') {
      if (!this.selected_value_nested[element.position].includes(input_value)) {
        this.selected_value_nested[element.position].push(input_value);
      } else {
        this.openSnackBar('Value already added.');
      }
    }
    //Fill out global nested value Object
  }

  /*selectNestedShortText(input_str, field){
    field.value.push(input_str)
    console.log(input_str, field)
  }*/

  unselectNestedValue(value, position) {
    const index = this.selected_value_nested[position].indexOf(value);
    this.selected_value_nested[position].splice(index, 1);
  }

  nestedFactorSelect() {
    //Check if nested Factor was selected and create Value object
    this.clearSelectedValue();
    if (this.data.values[this.selected_factor].input_type == 'nested') {
      //create value object
      this.data.values[this.selected_factor].whitelist.forEach((element) => {
        if (
          element.input_type == 'select' ||
          element.input_type == 'group_select'
        ) {
          this.selected_value_nested[element.position] = [];
        } else if (element.input_type == 'bool') {
          this.selected_value_nested[element.position] = false;
        } else if (element.input_type == 'value_unit') {
          this.selected_value_nested[element.position] = [];
        } else if (element.input_type == 'multi_autofill') {
          this.selected_value_nested[element.position] = [];
        } else if (element.input_type == 'restricted_short_text') {
          this.selected_value_nested[element.position] = [];
        }
      });
    }
  }

  applyNestedSearchFilter(search_str: string, search_info: any, element) {
    console.log('Search string:', search_str);
    this.apiService
      .searchWhitelistElements(search_str, 25, search_info)
      .then((res: any) => {
        this.filter_list = res.filter(
          (single_res) =>
            !this.selected_value_nested[element.position].some(
              (elem) => elem === single_res,
            ),
        );
        return;
      });
  }

  removeFactor(element) {
    this.factorList.splice(this.factorList.indexOf(element), 1);

    this.updateTableData();
  }
  updateTableData() {
    this.factor_table = new MatTableDataSource(this.factorList);
  }

  openSnackBar(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: ['warning-snackbar'],
    });
  }

  generateConditionsDisabled() {
    if (this.factorList.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  editFactor(element) {
    this.selected_factor = element.factor;
    if (this.data.values[element.factor].input_type == 'value_unit') {
      // First group: matches a decimal number, either a whole number or a float
      // Second group: matches the unit, which starts with one or more letters,
      // followed by zero or more letters and numbers, and potentially multiple
      // slashes and additional letters and numbers.
      const regex = /(\d+(?:\.\d+)?)([a-zA-Z]+[a-zA-Z0-9]*(?:\/[a-zA-Z0-9]+)*)/;

      const values = element.values.map((value) => {
        const match = value.match(regex);
        return match[1];
      });

      const unit = element.values.map((value) => {
        const match = value.match(regex);
        return match[2];
      })[0];
      console.log(values, unit);
      this.selected_value_unit.value = values.join(',');
      this.selected_value_unit.unit = unit;
    }
    if (
      this.data.values[element.factor].input_type == 'select' ||
      this.data.values[element.factor].input_type == 'multi_autofill' ||
      this.data.values[element.factor].input_type == 'group_select' ||
      this.data.values[element.factor].input_type == 'gene' ||
      this.data.values[element.factor].input_type == 'enrichment'
    ) {
      this.selected_value = element.values;
    }
    if (this.data.values[element.factor].input_type == 'nested') {
      this.nestedFactorSelect();
      console.log(this.selected_value_nested);
      this.data.values[element.factor].whitelist.forEach((input_field) => {
        console.log(
          input_field,
          this.selected_value_nested,
          element.values[0][input_field.position],
        );
        if (
          input_field.input_type == 'select' ||
          input_field.input_type == 'group_select'
        ) {
          input_field.value = element.values[0][input_field.position];
        } else if (input_field.input_type == 'value_unit') {
          var number_pattern = /[0-9]*\.?[0-9]/g;
          var str_pattern = /[a-zA-Z]/g;
          var value_ls = [];
          var unit = '';
          element.values[0][input_field.position].forEach((value_unit) => {
            var value = value_unit.match(number_pattern).toString();
            value_ls.push(value);
            unit = value_unit.match(str_pattern).join('');
          });
          console.log(value_ls, unit);
          input_field.value = value_ls.join(',');
          input_field.unit = unit;
        }

        if (input_field.input_type == 'multi_autofill') {
          console.log(
            'autofill',
            input_field,
            element.values[0][input_field.position],
          );
          element.values[0][input_field.position].forEach((value) => {
            this.nestedValuesSelect(input_field, value);
          });
        } else {
          this.nestedValuesSelect(input_field);
        }
      });
    }
    this.selected_factor = element.factor;
    this.factorList.splice(this.factorList.indexOf(element), 1);
    this.updateTableData();
  }

  displayNested(element) {
    var displayArray = [];
    this.data.values[element.factor].whitelist.forEach((factor) => {
      if (element.values[0][factor.position].length > 0) {
        displayArray.push({
          name: factor.displayName,
          value: element.values[0][factor.position],
        });
      }
    });
    return displayArray;
  }
}
