import { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/organisms/PageHeader';
import DataTable from '@/components/molecules/DataTable';
import StatCard from '@/components/molecules/StatCard';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import PaymentModal from '@/components/organisms/PaymentModal';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import { paymentService } from '@/services/api/paymentService';
import { studentService } from '@/services/api/studentService';

function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, studentsData] = await Promise.all([
        paymentService.getAll(),
        studentService.getStudents()
      ]);
      setFees(paymentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayment = (student) => {
    setSelectedStudent(student);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedStudent(null);
    loadData();
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const feeStats = {
    totalCollected: fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0),
    totalPending: fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0),
    totalStudents: students.length,
    overduePayments: fees.filter(f => f.status === 'overdue').length
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Student Name',
      render: (fee) => (
        <div>
          <div className="font-medium text-gray-900">{fee.studentName}</div>
          <div className="text-sm text-gray-500">ID: {fee.studentId}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (fee) => (
        <span className="font-semibold text-gray-900">
          ₹{fee.amount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (fee) => (
        <span className={fee.status === 'overdue' ? 'text-red-600' : 'text-gray-600'}>
          {new Date(fee.dueDate).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (fee) => {
        const statusConfig = {
          paid: { color: 'green', label: 'Paid' },
          pending: { color: 'yellow', label: 'Pending' },
          overdue: { color: 'red', label: 'Overdue' }
        };
        const config = statusConfig[fee.status] || statusConfig.pending;
        return <Badge color={config.color}>{config.label}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (fee) => (
        <div className="flex gap-2">
          {fee.status !== 'paid' && (
            <Button
              size="sm"
              onClick={() => handleCollectPayment(fee)}
              className="flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" />
              Collect
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Track and manage student fee payments"
        action={
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Collected"
          value={`₹${feeStats.totalCollected.toLocaleString()}`}
          icon={CheckCircle}
          trend={{ value: 12, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${feeStats.totalPending.toLocaleString()}`}
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
          color="yellow"
        />
        <StatCard
          title="Total Students"
          value={feeStats.totalStudents}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Overdue Payments"
          value={feeStats.overduePayments}
          icon={DollarSign}
          trend={{ value: 3, isPositive: false }}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' }
            ]}
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredFees}
          columns={columns}
          emptyMessage="No fee records found"
        />
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          student={selectedStudent}
        />
      )}
    </div>
  );
}

export default Fees;