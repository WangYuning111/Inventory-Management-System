import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 导入组件（路径严格对应你左侧的文件结构）
import { HomeComponent } from './home/home.component';
import { ItemManageComponent } from './item-manage/item-manage.component';
import { SearchComponent } from './search/search.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { HelpComponent } from './help/help.component';

// 路由规则（作业要求的5个页面）
const routes: Routes = [
  { path: '', component: HomeComponent },          // 首页
  { path: 'manage', component: ItemManageComponent }, // 物品管理
  { path: 'search', component: SearchComponent },    // 搜索
  { path: 'privacy', component: PrivacyComponent },  // 隐私安全
  { path: 'help', component: HelpComponent }         // 帮助
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }