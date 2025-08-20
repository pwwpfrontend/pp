import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Shield,
  User,
  Crown,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Building,
  MapPin
} from 'lucide-react';

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock user data - replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockUsers = [
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@company.com',
            company: 'Tech Solutions Inc.',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            status: 'pending',
            role: 'level1',
            appliedDate: '2024-01-15',
            notes: 'Experienced IT consultant looking to expand partnership'
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.j@expertconsulting.com',
            company: 'Expert Consulting Group',
            phone: '+1 (555) 987-6543',
            location: 'New York, NY',
            status: 'approved',
            role: 'level2',
            appliedDate: '2024-01-10',
            approvedDate: '2024-01-12',
            notes: 'Strong track record in enterprise solutions'
          },
          {
            id: 3,
            name: 'Michael Chen',
            email: 'm.chen@mastertech.com',
            company: 'Master Technology Partners',
            phone: '+1 (555) 456-7890',
            location: 'Austin, TX',
            status: 'approved',
            role: 'level3',
            appliedDate: '2024-01-05',
            approvedDate: '2024-01-08',
            notes: 'Premier partner with excellent performance'
          },
          {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@startup.io',
            company: 'Startup Innovations',
            phone: '+1 (555) 321-0987',
            location: 'Seattle, WA',
            status: 'rejected',
            role: 'level1',
            appliedDate: '2024-01-20',
            rejectedDate: '2024-01-22',
            notes: 'Company too small, insufficient resources'
          }
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handle user approval
  const handleApproveUser = async (userId) => {
    try {
      // TODO: Implement actual API call
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }
          : user
      ));
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user. Please try again.');
    }
  };

  // Handle user rejection
  const handleRejectUser = async (userId) => {
    try {
      // TODO: Implement actual API call
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'rejected', rejectedDate: new Date().toISOString().split('T')[0] }
          : user
      ));
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user. Please try again.');
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      // TODO: Implement actual API call
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const roleConfig = {
      level1: { color: 'bg-blue-100 text-blue-800', icon: Shield, name: 'Professional' },
      level2: { color: 'bg-purple-100 text-purple-800', icon: User, name: 'Expert' },
      level3: { color: 'bg-yellow-100 text-yellow-800', icon: Crown, name: 'Master' }
    };
    
    const config = roleConfig[role] || roleConfig.level1;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.name}
      </span>
    );
  };

  // User Details Modal
  const UserDetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Company Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Company</label>
                    <p className="text-gray-900">{selectedUser.company}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Location</label>
                    <p className="text-gray-900">{selectedUser.location}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Partnership Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Current Role</label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Applied Date</label>
                  <p className="text-gray-900">{selectedUser.appliedDate}</p>
                </div>
                {selectedUser.approvedDate && (
                  <div>
                    <label className="text-sm text-gray-500">Approved Date</label>
                    <p className="text-gray-900">{selectedUser.approvedDate}</p>
                  </div>
                )}
                {selectedUser.rejectedDate && (
                  <div>
                    <label className="text-sm text-gray-500">Rejected Date</label>
                    <p className="text-gray-900">{selectedUser.rejectedDate}</p>
                  </div>
                )}
              </div>
            </div>
            
            {selectedUser.notes && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedUser.notes}</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Main content */}
      <main className="pt-16">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage partner applications, approve users, and assign partnership levels</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="level1">Professional</option>
                    <option value="level2">Expert</option>
                    <option value="level3">Master</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Users ({filteredUsers.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#405952] mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading users...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <p className="text-gray-600 mb-4">{error}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No users found matching your criteria</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[#405952] flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.company}</div>
                          <div className="text-sm text-gray-500">{user.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.appliedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {user.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveUser(user.id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            {user.status === 'approved' && (
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#405952]"
                              >
                                <option value="level1">Professional</option>
                                <option value="level2">Expert</option>
                                <option value="level3">Master</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* User Details Modal */}
      {showUserModal && <UserDetailsModal />}
    </div>
  );
};

export default AdminUsers;

