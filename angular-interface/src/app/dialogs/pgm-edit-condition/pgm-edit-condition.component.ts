import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pgm-edit-condition',
  templateUrl: './pgm-edit-condition.component.html',
  styleUrls: ['./pgm-edit-condition.component.scss'],
  standalone: false,
})
export class PgmEditConditionComponent implements OnInit {
  original_sample = [];
  desease_ls = [];
  treatment_ls = [];
  sample_ls = [];
  dummy_count = 0;
  sample = [];
  filter_list = [];

  styling_vars = { input_types: { std: ['60', '40'] } };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
  ) {
    this.sample = JSON.parse(JSON.stringify(this.data.condition.input_fields));
    this.sample_ls = this.data.condition.list_value;
    console.log('new dummy/data:', this.sample);
    console.log('data', this.data);
    this.original_sample = JSON.parse(JSON.stringify(this.sample));
    // this.gene_filtered_list = this.data.whitelist.gene.slice(0, 50)
    //Filter for gene value if != null !!!
    //this.gene_filter = this.sample.filter(v => v.position == "experimental_setting:conditions:biological_replicates:samples:gene" && v.value)[0].value
  }

  ngOnInit(): void {}

  applyRestrictedShortText(input_event, regex_string, max_length, field) {
    const input = input_event.target.value;
    const regex = new RegExp(regex_string, 'g');
    const sanitizedInput = input.replace(regex, '').slice(0, max_length);
    input_event.target.value = sanitizedInput;
    field.value = sanitizedInput;
  }

  applySearchFilter(search_str: string, search_info: any) {
    console.log('Search string:', search_str);
    this.apiService
      .searchWhitelistElements(search_str, 25, search_info)
      .then((res: any) => {
        this.filter_list = res;
        return;
      });
  }

  selectSomeValues(value, element) {
    console.log('select value', value);
    element.list_value.push(value);
    this.filter_list = [];
    console.log('selected element', element);
  }

  addToGenericList(element) {
    element.list_value.push(JSON.parse(JSON.stringify(element.value)));
    element.value = '';
    console.log(element);
  }

  addDisabledToGenericList(element) {
    if (element.value != '' && element.value != null) {
      return false;
    } else {
      return true;
    }
  }

  deleteFromGenericList(element, list_item) {
    element.list_value.splice(element.list_value.indexOf(list_item), 1);
    console.log(element);
  }

  unselectValue(vlaue, element) {
    const index = element.list_value.indexOf(vlaue);
    element.list_value.splice(index, 1);
  }

  addSampleDisabled() {
    {
      var filled_out_ls = [];
      this.sample.forEach((field) => {
        if (field.mandatory) {
          if (
            field.position !=
            'experimental_setting:conditions:biological_replicates:samples:technical_replicates'
          ) {
            if (field.input_type == 'value_unit') {
              if (field.value && field.value_unit) {
                filled_out_ls.push(true);
              } else {
                filled_out_ls.push(false);
              }
            } else if (field.list || field.input_type == 'single_autofill') {
              if (field.list_value.length > 0) {
                filled_out_ls.push(true);
              } else {
                filled_out_ls.push(false);
              }
            } else {
              if (field.value) {
                filled_out_ls.push(true);
              } else {
                filled_out_ls.push(false);
              }
            }
          }
        }
      });
      console.log(filled_out_ls);
      if (filled_out_ls.includes(false)) {
        return true;
      } else {
        return false;
      }
    }
  }

  addSample() {
    if (
      this.sample.filter(
        (e) =>
          e.position ==
          'experimental_setting:conditions:biological_replicates:samples:sample_name',
      )[0].value != null
    ) {
      this.testIfDisabledInputAdded();
      this.sample_ls.push(JSON.parse(JSON.stringify(this.sample)));
      this.sample = JSON.parse(JSON.stringify(this.original_sample));
      console.log(this.sample_ls);
      this.updateSampleNames();
    } else {
      this.openSnackBar('Please enter a sample name.');
    }
  }

  testIfDisabledInputAdded() {
    var elements_to_test = this.sample.filter(
      (e) => e.title && e.list && e.input_disabled,
    );
    elements_to_test.forEach((input_element) => {
      var input_fields_disabled = [];
      input_element.input_fields.forEach((input_field) => {
        input_fields_disabled.push(input_field.input_disabled);
      });
      if (input_fields_disabled.includes(true)) {
        this.addToGenericExpandable(input_element);
      }
    });
  }

  removeSample(sample) {
    this.sample_ls.splice(this.sample_ls.indexOf(sample), 1);
    this.updateSampleNames();
  }

  openSnackBar(message) {
    this.snackBar.open(message, '', {
      duration: 4000,
      panelClass: ['warning-snackbar'],
    });
  }
  updateSampleNames() {
    this.sample_ls.forEach((sample, i) => {
      var sample_name = sample.filter(
        (input) =>
          input.position ==
          'experimental_setting:conditions:biological_replicates:samples:sample_name',
      )[0].value;
      console.log(
        Number(sample_name.split('_')[sample_name.split('_').length - 1]),
      );
      if (
        !isNaN(
          Number(sample_name.split('_')[sample_name.split('_').length - 1]),
        )
      ) {
        var sample_name_as_ls = sample_name.split('_');
        sample_name_as_ls.pop();
        sample_name = sample_name_as_ls.join('_');
      }
      sample.filter(
        (input) =>
          input.position ==
          'experimental_setting:conditions:biological_replicates:samples:sample_name',
      )[0].value = sample_name + '_' + String(i + 1);
    });
  }

  addToGenericExpandable(element) {
    console.log(element);
    var used_unique_values = [];
    var unique_field: any;
    var value_to_check = '';

    if (element.ident_key) {
      //ident_key block

      unique_field = element.input_fields.filter(
        (input) => input.position == element.ident_key,
      )[0];
      console.log(unique_field);
      if (unique_field.value) {
        element.list_value.forEach((input_element) => {
          used_unique_values.push(
            input_element.filter(
              (input) => input.position == element.ident_key,
            )[0].value,
          );
        });
        value_to_check = unique_field.value;
      } else if (unique_field.list_value) {
        element.list_value.forEach((input_element) => {
          used_unique_values.push(
            input_element
              .filter((input) => input.position == element.ident_key)[0]
              .list_value.sort((a, b) => b.localeCompare(a))
              .join(','),
          );
        });
        value_to_check = unique_field.list_value
          .sort((a, b) => b.localeCompare(a))
          .join(',');
      }
      console.log(value_to_check);
      console.log(used_unique_values);
    }

    if (used_unique_values.includes(value_to_check)) {
      console.log('already added');
      this.openSnackBar(
        'This value is already added. Please edit or delete the value below.',
      );
    } else {
      console.log('new one');
      element.list_value.push(JSON.parse(JSON.stringify(element.input_fields)));
      element.input_fields.forEach((field) => {
        field.value = null;
        if (field.list_value) {
          field.list_value = [];
        }

        field.input_disabled = false;
      });
    }
  }
  deleteFromGenericExpandable(element, list_item) {
    element.list_value.splice(element.list_value.indexOf(list_item), 1);
    console.log(element);
  }

  editGenericExpandable(element, list_item) {
    element.input_fields = JSON.parse(JSON.stringify(list_item));
    element.list_value.splice(element.list_value.indexOf(list_item), 1);
  }

  deleteDisabledFromGenericExpandable(element) {
    var input_disabled_ls = [];
    element.forEach((element) => {
      input_disabled_ls.push(element.input_disabled);
    });
    if (input_disabled_ls.includes(true)) {
      return true;
    } else {
      return false;
    }
  }

  addDisabledToGenericExpandable(element) {
    var filled_out_ls = [];
    element.input_fields.forEach((field) => {
      if (field.mandatory) {
        if (field.input_type == 'value_unit') {
          if (field.value && field.value_unit) {
            filled_out_ls.push(true);
          } else {
            filled_out_ls.push(false);
          }
        } else if (field.list || field.input_type == 'single_autofill') {
          if (field.list_value.length > 0) {
            filled_out_ls.push(true);
          } else {
            filled_out_ls.push(false);
          }
        } else {
          if (field.value) {
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
  }

  editSample(sample) {
    this.sample = JSON.parse(JSON.stringify(sample));
    this.sample_ls.splice(this.sample_ls.indexOf(sample), 1);
  }
  inputFromSample(sample) {
    this.sample = JSON.parse(JSON.stringify(sample));
  }
  copyAndPasteSample(sample) {
    this.inputFromSample(sample);
    this.addSample();
  }
}
