import { Record } from 'immutable';
import { RouterState } from 'connected-react-router';

import { ADMIN_NAMESPACE } from '../../modules/admin/constants';
import { AdminStateRecord } from '../../modules/admin/state/index';
import { CORE_NAMESPACE } from '../../modules/core/constants';
import { CoreStateRecord } from '../../modules/core/state/index';
import { DASHBOARD_NAMESPACE } from '../../modules/dashboard/constants';
import { DashboardStateRecord } from '../../modules/dashboard/state/index';
import { USERS_NAMESPACE } from '../../modules/users/constants';
import { UsersStateRecord } from '../../modules/users/state/index';

export interface RootStateProps {
  admin: AdminStateRecord;
  core: CoreStateRecord;
  dashboard: DashboardStateRecord;
  users: UsersStateRecord;
  router?: RouterState;
  watcher: any;
}

export class RootStateRecord extends Record<RootStateProps>({
  [ADMIN_NAMESPACE]: new AdminStateRecord(),
  [CORE_NAMESPACE]: new CoreStateRecord(),
  [DASHBOARD_NAMESPACE]: new DashboardStateRecord(),
  [USERS_NAMESPACE]: new UsersStateRecord(),
  router: undefined,
  watcher: undefined,
}) {}