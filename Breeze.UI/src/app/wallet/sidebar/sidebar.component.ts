import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
import { Router } from '@angular/router';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';
import { NavigationService } from '../../shared/services/navigation.service';

import { WalletInfo } from '../../shared/classes/wallet-info';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private globalService: GlobalService, private apiService: ApiService, 
                private router: Router, private modalService: NgbModal, private genericModalService: ModalService, 
                    private navigationService: NavigationService) { }

  ngOnInit() {
  }

  public loadDeStreamWallet() {
      this.globalService.setCoinName("DeStreamCoin");
      this.globalService.setCoinUnit("DST");

    this.router.navigate(['/wallet/destream-wallet']);
  }

  public logOut() {
    const modalRef = this.modalService.open(LogoutConfirmationComponent);
  }
}
