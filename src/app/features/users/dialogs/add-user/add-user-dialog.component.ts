import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { RoleName, RoleDisplayNames } from '@core/models/role.model';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {
  roles: RoleName[] = [
    RoleName.ADMIN,
    RoleName.CUSTOMER,
    RoleName.INVENTORY_STAFF,
    RoleName.LOGISTICS_MANAGER
  ];

  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: [RoleName.CUSTOMER, Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  addUser(): void {
    if (this.userForm.valid) {
      const newUser: User = this.userForm.value;
      this.userService.createUser(newUser).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: Error) => {
          console.error('Error adding user', error);
          // TODO: Add error handling
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getRoleDisplayName(role: RoleName): string {
    return RoleDisplayNames[role];
  }
}
