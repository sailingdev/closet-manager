import { Component, OnInit } from '@angular/core';
import { ClosetService } from '../../../services/closet.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { Clothing } from '../../../models/clothing.model';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-closet-widget',
  templateUrl: './closet-widget.component.html',
  styleUrls: ['./closet-widget.component.scss']
})
export class ClosetWidgetComponent implements OnInit {
  closetList: Array<Clothing>;
  currentUser: User;
  filterOptions: Array<string>;
  sortOptions: Array<string>;

  constructor(private closetService: ClosetService,
              private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(
      user => {
        this.currentUser = user;
        this.getAllClothes();
      }
    );
    this.filterOptions = this.closetService.getFilterOptions();
    this.sortOptions = this.closetService.getSortOptions();
  }

  getAllClothes(): void {
    this.closetService.getAllClothes(this.currentUser).subscribe(
      data => this.closetList = data,
      error => console.log('error', error)
    );
  }

}
