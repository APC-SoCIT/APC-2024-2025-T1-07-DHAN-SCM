import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { User } from '@core/models/user.model';
import { Role } from '@core/models/role.model';

import { AddUserDialogComponent } from './dialogs/add-user/add-user-dialog.component';
import { EditUserDialogComponent } from './dialogs/edit-user/edit-user-dialog.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['username', 'email', 'role', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  roles$: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private dialog: MatDialog
  ) {
    this.roleService.getAllRoles().pipe(
      catchError(() => [])
    ).subscribe(roles => this.roles$.next(roles));
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.paginator = this.paginator;
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '400px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      if (user._id) {
        this.userService.deleteUser(user._id).subscribe({
          next: () => this.loadUsers(),
          error: (err) => console.error('Error deleting user', err)
        });
      }
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRoleName(role?: string): string {
    return role || 'Unassigned';
  }
}
