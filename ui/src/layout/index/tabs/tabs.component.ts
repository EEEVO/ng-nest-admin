import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IndexService, Menu } from '../index.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { ReuseStrategyService } from 'src/services/reuse-strategy.service';
import { NavService } from 'src/services/nav.service';
import { AuthService } from 'src/services/auth.service';
import { XConfigService, X_THEME_DARK_COLORS, X_THEME_COLORS } from '@ng-nest/ui/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TabsComponent implements OnInit {
  get activatedIndex() {
    return this.indexService.session.tabsPage
      ? this.indexService.session.tabsPage.findIndex((x) => x.router === this.indexService.session.activatedPage)
      : -1;
  }

  get showClose() {
    return this.indexService.session.tabsPage && this.indexService.session.tabsPage.length > 1 ? true : false;
  }

  get getData() {
    return this.indexService.session.tabsPage ? this.indexService.session.tabsPage : [];
  }

  dark = false;

  constructor(
    public indexService: IndexService,
    private router: Router,
    public auth: AuthService,
    public location: Location,
    public nav: NavService,
    public configService: XConfigService
  ) {}

  ngOnInit() {}

  /**
   * tab点击事件
   *
   * @memberof TabsComponent
   */
  tab(index: number) {
    const tab = this.indexService.session.tabsPage?.find((x, i) => i === index);
    if (tab && tab.router) {
      let page = tab.router;
      let subRoot = tab.subPage;
      let param = tab.param;
      if (subRoot) {
        page += `/${subRoot}`;
      }
      this.router.navigate([`/${environment.layout}/${page}`, param]);
    }
  }

  /**
   * tab关闭事件
   *
   * @memberof TabsComponent
   */
  close(tab: Menu) {
    let tabsPage = this.indexService.session.tabsPage as Menu[];
    let deleteIndex = 0;

    // 清除标签页
    _.remove(tabsPage, (x, index) => {
      if (x.router === tab.router) deleteIndex = index;
      return x.router === tab.router;
    });
    ReuseStrategyService.deleteRouteSnapshot(`/${environment.layout}/${tab.router}`);
    this.indexService.session = { tabsPage: tabsPage };
    this.indexService.session.tabsPage = [...tabsPage];

    // 判断路由跳转
    if (tab.router === this.indexService.session.activatedPage) {
      let pushIndex = null;
      if (deleteIndex === 0 && tabsPage.length >= 1) {
        pushIndex = 0;
      }
      if (deleteIndex > 0 && tabsPage.length > deleteIndex) {
        pushIndex = deleteIndex;
      }
      if (deleteIndex > 0 && tabsPage.length <= deleteIndex) {
        pushIndex = deleteIndex - 1;
      }
      if (pushIndex !== null) {
        this.tab(pushIndex);
      }
    }
  }

  /**
   * 展开，缩起点击
   *
   * @memberof ToggleComponent
   */
  toggle() {
    this.indexService.local = {
      siderShrink: !this.indexService.local.siderShrink
    };
  }

  /**
   * 退出
   */
  logout() {
    this.auth.logout().subscribe((x) => {
      if (x) {
        this.indexService.removeSession();
        this.indexService.session = { tabsPage: [] };
        this.nav.destroy();
        ReuseStrategyService.deleteRouteSnapshot();
        ReuseStrategyService.deleteRouteSnapshot(this.location.path());
        this.router.navigate(['/login']);
      }
    });
  }

  theme() {
    this.dark = !this.dark;
    if (this.dark) {
      this.configService.setDarkTheme({ colors: X_THEME_DARK_COLORS });
    } else {
      this.configService.setLightTheme({ colors: X_THEME_COLORS });
    }
  }
}
