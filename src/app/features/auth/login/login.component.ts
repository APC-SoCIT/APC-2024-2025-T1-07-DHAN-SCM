import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { LoginFormService } from './login-form.service';
import { LoginPresenterService } from './login-presenter.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginFormService, LoginPresenterService]
})
export class LoginComponent implements OnInit {
  constructor(
    private loginFormService: LoginFormService,
    private loginPresenter: LoginPresenterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginFormService.initForm();
  }

  onSubmit(): void {
    if (this.loginFormService.loginForm.valid) {
      const { email, password } = this.loginFormService.loginForm.value;
      this.loginPresenter.login(email, password, this.route);
    }
  }

  get loginForm() {
    return this.loginFormService.loginForm;
  }
}
