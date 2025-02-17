import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { RoleName, RoleDisplayNames } from '@core/models/role.model';

@Component({
  selector: 'app-edit-user-dialog',
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
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent {
  roles: RoleName[] = [
    RoleName.ADMIN,
    RoleName.CUSTOMER,
    RoleName.INVENTORY_STAFF,
    RoleName.LOGISTICS_MANAGER
  ];

  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      _id: [data.user._id],
      username: [data.user.username, [Validators.required, Validators.minLength(3)]],
      email: [data.user.email, [Validators.required, Validators.email]],
      firstName: [data.user.firstName, Validators.required],
      lastName: [data.user.lastName, Validators.required],
      role: [data.user.role, Validators.required]
    });
  }

  updateUser(): void {
    if (this.userForm.valid) {
      const updatedUser: User = this.userForm.value;
      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: Error) => {
          console.error('Error updating user', error);
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
