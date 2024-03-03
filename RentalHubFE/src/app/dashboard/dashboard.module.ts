import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { PostSensorComponent } from './post-sensor/post-sensor.component';
import { DashboardRoutingModule } from './dashboard.-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PostSensorDialogComponent } from './post-sensor/post-sensor-dialog/post-sensor-dialog.component';
import { HistoryCheckedPostsComponent } from './history-checked-posts/history-checked-posts.component';
import { HistoryDeniedPostsComponent } from './history-denied-posts/history-denied-posts.component';
import { AccountEditDialogComponent } from './account-edit-dialog/account-edit-dialog.component';
import { UpdateAvatarDialogComponent } from './update-avatar-dialog/update-avatar-dialog.component';
import { LoginDetailUpdateDialogComponent } from './login-detail-update-dialog/login-detail-update-dialog.component';
import { ReportedPostsComponent } from './reported-posts/reported-posts.component';

@NgModule({
  declarations: [DashboardComponent, PostSensorComponent, PostSensorDialogComponent, HistoryCheckedPostsComponent, HistoryDeniedPostsComponent, AccountEditDialogComponent, UpdateAvatarDialogComponent, LoginDetailUpdateDialogComponent, ReportedPostsComponent],
  imports: [CommonModule, FormsModule, DashboardRoutingModule, SharedModule],
  providers: [],
})
export class DashBoardModule {}
