import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/accounts/accounts.service';
import { User } from 'src/app/auth/user.model';
import { PaginationService } from 'src/app/shared/pagination/pagination.service';
import { Hosts } from '../manage-hosts/host.model';
import { AddressService } from './address.service';
import { AddressSensorDialogComponent } from './address-sensor-dialog/address-sensor-dialog.component';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-manage-addresses',
  templateUrl: './manage-addresses.component.html',
  styleUrls: ['./manage-addresses.component.scss'],
})
export class ManageAddressesComponent implements OnInit, OnDestroy {
  $destroy: Subject<boolean> = new Subject<boolean>();
  isLoading = false;
  displayedColumns: string[] = ['id', 'name', 'address', 'total_rooms', 'date'];
  dataSource!: any[] | null;
  myProfile!: User | null;
  currentUid!: string | null;
  totalPages: number = 1;
  currentPage: number = 1;
  pageItemLimit: number = 5;
  myProfileSub = new Subscription();
  currentAddressReqStatus: number = 0; //Chờ duyệt

  constructor(
    private accountService: AccountService,
    public dialog: MatDialog,
    private paginationService: PaginationService,
    private addressService: AddressService,
    private notifierService: NotifierService
  ) {}
  ngOnDestroy(): void {
    this.$destroy.unsubscribe();
  }

  ngOnInit() {
    this.isLoading = true;
    this.currentPage = 1;
    this.currentAddressReqStatus = 0;
    if (this.currentUid) {
      this.myProfile = this.accountService.getProfile(this.currentUid);
    }
    this.addressService
      .getAddressesRequests(
        this.currentAddressReqStatus,
        this.currentPage,
        this.pageItemLimit
      )
      .subscribe(
        (res) => {
          if (res.data) {
            this.dataSource = res.data;
            this.totalPages = res.pagination.total;
          }

          this.isLoading = false;
        },
        (errMsg) => {
          this.isLoading = false;
        }
      );
  }

  //Xem chi tiết hồ sơ đăng ký địa chỉ
  seeDetail(addressReq: any) {
    console.log('Seeing addressReq detail....', addressReq);
    window.scrollTo(0, 0); // Scrolls the page to the top
    const dialogRef = this.dialog.open(AddressSensorDialogComponent, {
      width: '800px',
      data: {
        addressId: addressReq._id,
        requestStatus: this.currentAddressReqStatus,
      },
    });
    //Lọc hồ sơ sau khi kiểm duyệt xong
    let sub = dialogRef.componentInstance.sensorResult.subscribe((identId) => {
      if (this.dataSource) {
        this.dataSource = this.dataSource.filter(
          (addressReq: Hosts) => addressReq._id !== identId
        );
      }
    });
    sub = dialogRef.componentInstance.denySensorResult.subscribe((identId) => {
      if (this.dataSource) {
        this.dataSource = this.dataSource.filter(
          (addressReq: Hosts) => addressReq._id !== identId
        );
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      sub.unsubscribe();
    });
  }

  //position can be either 1 (navigate to next page) or -1 (to previous page)
  changeCurrentPage(
    position: number,
    toFirstPage: boolean,
    toLastPage: boolean
  ) {
    this.isLoading = true;
    if (position === 1 || position === -1) {
      this.currentPage = this.paginationService.navigatePage(
        position,
        this.currentPage
      );
    }
    if (toFirstPage) {
      this.currentPage = 1;
    } else if (toLastPage) {
      this.currentPage = this.totalPages;
    }
    this.addressService
      .getAddressesRequests(
        this.currentAddressReqStatus,
        this.currentPage,
        this.pageItemLimit
      )
      .subscribe(
        (res) => {
          if (res.data) {
            this.dataSource = res.data;
            this.totalPages = res.pagination.total;
          }

          this.isLoading = false;
        },
        (errMsg) => {
          this.isLoading = false;
        }
      );
  }

  changeStatusOfReq(type: string): void {
    switch (type) {
      case 'Waiting':
        console.log('Change status of hosts to Waiting....');
        this.currentAddressReqStatus = 0;
        break;
      case 'Sensored':
        console.log('Change status of hosts to Sensored....');
        this.currentAddressReqStatus = 1;
        break;
      case 'Denied':
        console.log('Change status of hosts to Denied....');
        this.currentAddressReqStatus = 2;
        break;
      default:
    }
    this.currentPage = 1;
    this.dataSource = null;
    this.addressService
      .getAddressesRequests(
        this.currentAddressReqStatus,
        this.currentPage,
        this.pageItemLimit
      )
      .subscribe(
        (res) => {
          if (res.data) {
            this.dataSource = res.data;
            // console.log(
            //   '🚀 ~ ManageHostsComponent ~ changeStatusOfHosts ~ this.dataSource:',
            //   this.dataSource
            // );
            this.totalPages = res.pagination.total;
          }

          this.isLoading = false;
        },
        (errMsg) => {
          this.isLoading = false;
        }
      );
  }

  reloadData() {
    this.isLoading = true;
    this.currentPage = 1;
    this.addressService
      .getAddressesRequests(
        this.currentAddressReqStatus,
        this.currentPage,
        this.pageItemLimit
      )
      .subscribe(
        (res) => {
          if (res.data) {
            this.dataSource = res.data;
            this.totalPages = res.pagination.total;
          }

          this.isLoading = false;
        },
        (errMsg) => {
          this.isLoading = false;
        }
      );
  }

  search(form: any) {
    this.isLoading = true;
    let active: boolean = false;
    if (this.currentAddressReqStatus === 1) {
      active = true;
    }
    this.addressService
      .searchAddressesById(form.keyword, active, 1, this.pageItemLimit)
      .pipe(takeUntil(this.$destroy))
      .subscribe(
        (res) => {
          if (res.data) {
            this.isLoading = false;
            this.dataSource = [];
            this.currentPage = 1;
            this.totalPages = 1;
            this.dataSource = res.data;
          }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          this.notifierService.notify(
            'error',
            'Không có kết quả tìm kiếm trùng khớp!'
          );
        }
      );
  }
}
