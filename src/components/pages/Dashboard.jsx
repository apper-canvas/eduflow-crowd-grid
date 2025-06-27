import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import StatCard from '@/components/molecules/StatCard';
import DataTable from '@/components/molecules/DataTable';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import PaymentModal from '@/components/organisms/PaymentModal';
import studentService from '@/services/api/studentService';
import batchService from '@/services/api/batchService';
import paymentService from '@/services/api/paymentService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [todayClasses, setTodayClasses] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, student: null });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [students, batches, payments] = await Promise.all([
        studentService.getAll(),
        batchService.getAll(),
        paymentService.getAll()
      ]);

      // Calculate stats
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'active').length;
      const totalBatches = batches.length;
      const pendingFees = students.reduce((sum, s) => sum + (s.totalFees - s.paidAmount), 0);
      const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalStudents,
        activeStudents,
        totalBatches,
        pendingFees,
        totalCollected
      });

      // Get today's classes
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayBatches = batches.filter(batch => 
        batch.schedule.days.includes(today)
      );
      setTodayClasses(todayBatches);

      // Get pending payments (students with due amounts)
      const overdue = students.filter(s => s.feeStatus === 'pending' || s.feeStatus === 'overdue');
      setPendingPayments(overdue);

      // Get recent payments
      const recent = payments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(payment => {
          const student = students.find(s => s.Id === payment.studentId);
          return { ...payment, studentName: student?.name || 'Unknown' };
        });
      setRecentPayments(recent);

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    loadDashboardData(); // Refresh all data
    toast.success('Dashboard updated with new payment');
  };

  const openPaymentModal = (student) => {
    setPaymentModal({ isOpen: true, student });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, student: null });
  };

  const paymentColumns = [
    {
      key: 'receiptNo',
      label: 'Receipt',
      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'studentName',
      label: 'Student',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-semibold text-secondary">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'mode',
      label: 'Mode',
      render: (value) => (
        <Badge variant="info" size="sm">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => format(new Date(value), 'dd MMM yyyy')
    }
  ];

  const pendingColumns = [
    {
      key: 'name',
      label: 'Student',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'totalFees',
      label: 'Total Fees',
      render: (value) => `₹${value.toLocaleString()}`
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      render: (value) => `₹${value.toLocaleString()}`
    },
    {
      key: 'dueAmount',
      label: 'Due',
      render: (value, row) => (
        <span className="font-semibold text-error">
          ₹{(row.totalFees - row.paidAmount).toLocaleString()}
        </span>
      )
    },
    {
      key: 'feeStatus',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'overdue' ? 'error' : 'warning'} size="sm">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <Button
          size="sm"
          variant="primary"
          icon="CreditCard"
          onClick={(e) => {
            e.stopPropagation();
            openPaymentModal(row);
          }}
        >
          Pay
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.......</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon="Users"
            onClick={() => navigate('/students')}
          >
            Manage Students
          </Button>
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => navigate('/students/add')}
          >
            Add Student
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="Users"
          color="primary"
          trend="up"
          trendValue="+12% this month"
        />
        <StatCard
          title="Active Batches"
          value={stats.totalBatches}
          icon="BookOpen"
          color="secondary"
          trend="up"
          trendValue="+2 new"
        />
        <StatCard
          title="Pending Fees"
          value={`₹${stats.pendingFees?.toLocaleString() || 0}`}
          icon="AlertCircle"
          color="warning"
          trend="down"
          trendValue="-5% this week"
        />
        <StatCard
          title="Total Collected"
          value={`₹${stats.totalCollected?.toLocaleString() || 0}`}
          icon="TrendingUp"
          color="success"
          trend="up"
          trendValue="+18% this month"
        />
      </motion.div>

      {/* Today's Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
          <Button
            variant="ghost"
            icon="Calendar"
            onClick={() => navigate('/schedule')}
          >
            View Schedule
          </Button>
        </div>
        
        {todayClasses.length === 0 ? (
          <EmptyState
            title="No classes today"
            description="Enjoy your day off! Check the schedule for upcoming classes."
            icon="Calendar"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map((batch) => (
              <motion.div
                key={batch.Id}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{batch.name}</h3>
                  <Badge variant="primary" size="sm">{batch.subject}</Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Clock" size={14} />
                    <span>{batch.schedule.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApperIcon name="MapPin" size={14} />
                    <span>{batch.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Users" size={14} />
                    <span>{batch.enrolledCount}/{batch.capacity} students</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
              <Button
                variant="ghost"
                icon="CreditCard"
                onClick={() => navigate('/fees')}
              >
                View All
              </Button>
            </div>
          </div>
          
          {pendingPayments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="All payments up to date"
                description="Great! No pending payments at the moment."
                icon="CheckCircle"
              />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <DataTable
                data={pendingPayments.slice(0, 5)}
                columns={pendingColumns}
                className="border-0 shadow-none"
              />
            </div>
          )}
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
              <Button
                variant="ghost"
                icon="History"
                onClick={() => navigate('/fees')}
              >
                View All
              </Button>
            </div>
          </div>
          
          {recentPayments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No recent payments"
                description="Payment history will appear here once you start recording payments."
                icon="CreditCard"
              />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <DataTable
                data={recentPayments}
                columns={paymentColumns}
                className="border-0 shadow-none"
              />
            </div>
          )}
        </motion.div>
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        student={paymentModal.student}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Dashboard;
