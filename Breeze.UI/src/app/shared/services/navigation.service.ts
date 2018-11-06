import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export enum Page {
    DeStream
}

@Injectable()
export class NavigationService {

    private readonly navBase = '/wallet';

    constructor(router: Router) {
        const navigation$ = router.events.filter(x => x instanceof NavigationEnd)
                                         .map(x => <NavigationEnd>x)
                                         .map(x => x.url);

        navigation$.filter(x => x === `${this.navBase}/destream-wallet`).subscribe(_ => this.pageSubject.next(Page.DeStream));
    }
    
    public pageSubject = new ReplaySubject(1);
}
