import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class LoginFormService {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  resetForm(): void {
    this.loginForm.reset();
  }

  getFormValue(): { email: string; password: string } {
    return this.loginForm.value;
  }
}
