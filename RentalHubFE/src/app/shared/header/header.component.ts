import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/accounts/accounts.service';
import { User } from 'src/app/auth/user.model';
import { NotificationService } from '../notifications/notification.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { resDataDTO } from '../resDataDTO';
import { MatDialog } from '@angular/material/dialog';
import { UpdateAvatarDialogComponent } from 'src/app/dashboard/update-avatar-dialog/update-avatar-dialog.component';
import { DisplayNotiDialogComponent } from '../display-noti-dialog/display-noti-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input('matBadge')
  content: string | number | undefined | null;

  @Input('matTooltipClass')
  tooltipClass: any;

  isLoading = false;
  error: string = '';
  searchResultChangedSub: Subscription = new Subscription();
  user!: User | null;
  fullName!: string;
  isAuthenticatedUser: boolean = false;
  seenNotiList!: any;
  unseenNotificaionList!: any;
  notificationTotals!: number;

  $destroy: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notifierService: NotifierService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.accountService.getCurrentUser
      .pipe(takeUntil(this.$destroy))
      .pipe(takeUntil(this.$destroy))
      .subscribe((user) => {
        console.log('On rendering headers...');
        console.log(user);
        this.isAuthenticatedUser = !!user;
        console.log('User is authenticated: ', this.isAuthenticatedUser);
        this.user = user;
        if (this.user?._fname && this.user?._lname) {
          this.fullName = this.user?._fname + ' ' + this.user._lname;
        }
      });

    if (this.isAuthenticatedUser) {
      //Lấy các noti đã xem
      this.notificationService.getCurrentSeenNotifications
        .pipe(takeUntil(this.$destroy))
        .subscribe((notifications) => {
          this.seenNotiList = notifications;
        });

      //Lấy các noti chưa xem
      this.notificationService.getCurrentUnseenNotifications
        .pipe(takeUntil(this.$destroy))
        .subscribe((unseenNotifications) => {
          this.unseenNotificaionList = unseenNotifications;
        });

      //Lấy tổng các noti chưa xem
      this.notificationService.getTotalNotifications
        .pipe(takeUntil(this.$destroy))
        .subscribe((notificationTotal) => {
          this.notificationTotals = notificationTotal;
        });
    } else {
      this.notificationTotals = 0;
      this.notificationService.setCurrentSeenNotifications([]);
      this.notificationService.setCurrentUnseenNotifications([]);
    }
  }

  ngOnInit() {}

  toMyPosting() {
    let uId = this.user?._id;
    this.router.navigate(['/profile/posting-history/', uId]);
  }

  toPostNew() {
    if (this.user !== null) {
      let uId = this.user?._id;
      this.router.navigate(['/profile/post-new/', uId]);
    } else {
      this.notifierService.notify('error', 'Vui lòng đăng nhập để đăng bài!');
    }
  }

  markAsReadAll() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: 'Bạn có chắc muốn đánh dấu đã đọc tất cả thông báo?',
    });
    const sub = dialogRef.componentInstance.confirmYes.subscribe(() => {
      this.notificationService
        .markAsReadAll()
        .pipe(takeUntil(this.$destroy))
        .subscribe(
          (res) => {
            if (res.data) {
              this.notifierService.notify(
                'success',
                'Đánh dấu đã đọc toàn bộ thông báo thành công'
              );
            }
          },
          (errMsg) => {
            this.notifierService.notify(
              'error',
              'Đã có lỗi xảy ra, vui lòng thử lại sau'
            );
          }
        );
    });
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  readNotiDetail(noti: any) {
    const dialog = this.dialog.open(DisplayNotiDialogComponent, {
      width: '600px',
      data: noti,
    });
  }

  toHome() {
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    this.$destroy.next(true);
  }

  logout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: 'Bạn có chắc muốn đăng xuất?',
    });
    const sub = dialogRef.componentInstance.confirmYes.subscribe(() => {
      let logoutObs: Observable<resDataDTO>;
      logoutObs = this.authService.logout(this.user?.RFToken);
      logoutObs.subscribe();
      this.router.navigate(['/auth/login']);
    });
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  updateAvatar() {
    const dialogRef = this.dialog.open(UpdateAvatarDialogComponent, {
      width: '400px',
      data: this.user?._avatar,
    });
  }
}
