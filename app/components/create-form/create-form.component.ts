import { Component, ViewChild, ViewContainerRef, OnInit, ElementRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})
export class CreateFormComponent implements OnInit {
  employeeFormGroup!: FormGroup;
  Email: any;
  balref: any;
  displayedColumns: string[] = ['Persolnal Detail', 'Date', 'Due Date', 'Amount', 'Interest', 'Actions'];
  reloadFlag = localStorage.getItem('reloadFlag');
  containerRef!: ViewContainerRef;
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  formGroup: any;

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    public service: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeFormGroup = this.fb.group({
      '_id': [],
      '_rev': [],
      'employee_name': ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      'phone': ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      'date': ['', Validators.required],
      'address': ['', Validators.required],
      'duedate': ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      'interest': ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      balance: [],
      profit: [],
      finalamt: [],
      balanceMonth: [],
      amtPerMonth: []
    });

    if (!this.reloadFlag) {
      localStorage.setItem('reloadFlag', 'true');
      location.reload();
    }

    if (localStorage.getItem('email') == null) {
      Swal.fire('UnAuthorized User', '', 'warning');
      this.router.navigateByUrl('/');
    }
    this.Email = localStorage.getItem('email');
  }

  printx() {
    localStorage.setItem('reloadFlag', '');
  }

  calculate() {
    const amt: number = this.employeeFormGroup.value.amount;
    const intr: number = this.employeeFormGroup.value.interest;
    const due: number = this.employeeFormGroup.value.duedate;
    const prof: number = amt * intr * due / 100;
    const bal: number = prof + amt;
    const amtpermon: Number = bal / due;
    this.employeeFormGroup.value.profit = prof;
    this.employeeFormGroup.value.balance = bal;
    this.employeeFormGroup.value.finalamt = bal;
    this.employeeFormGroup.value.amtPerMonth = amtpermon;
    this.employeeFormGroup.value.balanceMonth = due;
  }

  editbalance() {
    const balinput = this.employeeFormGroup.value.balance;
    const amtPerMonth = this.employeeFormGroup.value.amtPerMonth;
    const baldue = this.employeeFormGroup.value.balanceMonth;
    const balfix: Number = balinput - amtPerMonth;
    this.employeeFormGroup.value.balanceMonth = baldue - 1;
    this.employeeFormGroup.value.balance = balfix;
  }

  saveAction(): void {
    if (!this.employeeFormGroup.valid) {
      Swal.fire('Please Check All the Fields are Filled!', '', 'warning');
    } else {
      let employeeObject: any = this.employeeFormGroup.value;
      console.log(employeeObject);
      employeeObject['object_name'] = 'staff_name';

      if (employeeObject['_id'] == null) {
        delete employeeObject['_id'];
      }

      if (employeeObject['_rev'] == null) {
        delete employeeObject['_rev'];
      }

      let bulkDocsArray = [];
      bulkDocsArray.push(employeeObject);
      this.service.updateDocument(bulkDocsArray);

      this.resetAction();
      Swal.fire('Saved Successfully', '', 'success');
    }
  }

  resetAction(): void {
    this.employeeFormGroup.reset();
    this.employeeFormGroup.markAsUntouched();
  }

  logout() {
    localStorage.removeItem('email');
    this.router.navigateByUrl('/');
    localStorage.setItem('reloadFlag', '');
  }
}
