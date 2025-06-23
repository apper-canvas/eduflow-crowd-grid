import Dashboard from '@/components/pages/Dashboard';
import Students from '@/components/pages/Students';
import StudentDetail from '@/components/pages/StudentDetail';
import AddStudent from '@/components/pages/AddStudent';
import Batches from '@/components/pages/Batches';
import BatchDetail from '@/components/pages/BatchDetail';
import AddBatch from '@/components/pages/AddBatch';
import Schedule from '@/components/pages/Schedule';
import Fees from '@/components/pages/Fees';
import Teachers from '@/components/pages/Teachers';
import AddTeacher from '@/components/pages/AddTeacher';
import Notifications from '@/components/pages/Notifications';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  students: {
    id: 'students',
    label: 'Students',
    path: '/students',
    icon: 'Users',
    component: Students
  },
  studentDetail: {
    id: 'studentDetail',
    label: 'Student Detail',
    path: '/students/:id',
    icon: 'User',
    component: StudentDetail,
    hideFromNav: true
  },
  addStudent: {
    id: 'addStudent',
    label: 'Add Student',
    path: '/students/add',
    icon: 'UserPlus',
    component: AddStudent,
    hideFromNav: true
  },
  batches: {
    id: 'batches',
    label: 'Batches',
    path: '/batches',
    icon: 'BookOpen',
    component: Batches
  },
  batchDetail: {
    id: 'batchDetail',
    label: 'Batch Detail',
    path: '/batches/:id',
    icon: 'Book',
    component: BatchDetail,
    hideFromNav: true
  },
  addBatch: {
    id: 'addBatch',
    label: 'Add Batch',
    path: '/batches/add',
    icon: 'Plus',
    component: AddBatch,
    hideFromNav: true
  },
  schedule: {
    id: 'schedule',
    label: 'Schedule',
    path: '/schedule',
    icon: 'Calendar',
    component: Schedule
  },
  fees: {
    id: 'fees',
    label: 'Fees',
    path: '/fees',
    icon: 'CreditCard',
    component: Fees
  },
  teachers: {
    id: 'teachers',
    label: 'Teachers',
    path: '/teachers',
    icon: 'GraduationCap',
    component: Teachers
  },
  addTeacher: {
    id: 'addTeacher',
    label: 'Add Teacher',
    path: '/teachers/add',
    icon: 'UserPlus',
    component: AddTeacher,
hideFromNav: true
  },
  notifications: {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: 'Bell',
    component: Notifications
  }
};

export const routeArray = Object.values(routes);
export default routes;