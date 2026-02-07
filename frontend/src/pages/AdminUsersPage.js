import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, User, Eye, Ban, CheckCircle, Trash2, Key } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchUsers, updateUserRole, toggleUserBlock, deleteUser, resetUserPassword } from "../admin/usersApi";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }
    loadUsers();
  }, [currentUser, navigate]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      
      // If no users from backend, show message
      if (!data || data.length === 0) {
        console.log("No users from backend. Please connect the backend API.");
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleAdmin = async (userId, userName, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "منح" : "إزالة";
    
    if (!window.confirm(`هل أنت متأكد من ${action} صلاحيات الإدارة ${newRole === "admin" ? "لـ" : "من"} "${userName}"؟`)) {
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      toast.success(`تم ${action} صلاحيات الإدارة بنجاح`);
      loadUsers();
    } catch (error) {
      toast.error(`فشل في ${action} الصلاحيات`);
      console.error(error);
    }
  };

  const handleToggleBlock = async (userId, userName, isBlocked) => {
    const action = isBlocked ? "إلغاء حظر" : "حظر";
    
    if (!window.confirm(`هل أنت متأكد من ${action} المستخدم "${userName}"؟`)) {
      return;
    }

    try {
      await toggleUserBlock(userId, !isBlocked);
      toast.success(`تم ${action} المستخدم بنجاح`);
      loadUsers();
    } catch (error) {
      toast.error(`فشل في ${action} المستخدم`);
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ هذا الإجراء لا يمكن التراجع عنه!`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success("تم حذف المستخدم بنجاح");
      loadUsers();
    } catch (error) {
      toast.error("فشل في حذف المستخدم");
      console.error(error);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPassword = window.prompt(`أدخل كلمة المرور الجديدة للمستخدم "${userName}":`);
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    try {
      await resetUserPassword(userId, newPassword);
      toast.success("تم تغيير كلمة المرور بنجاح");
    } catch (error) {
      toast.error("فشل في تغيير كلمة المرور");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="إدارة المستخدمين" showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader title="إدارة المستخدمين" showBack showCart={false} showNotification={false} />

      {/* Search & Filters */}
      <div className="px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="pr-10 bg-[#121212] border-[#27272A] text-white"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#121212] border border-[#27272A] text-white rounded-lg"
        >
          <option value="all">كل المستخدمين</option>
          <option value="admin">المسؤولين</option>
          <option value="customer">العملاء</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="px-4 pb-3">
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-3">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-[#A1A1AA] text-xs">الإجمالي</p>
                <p className="text-lg font-bold text-[#D4AF37]">{users.length}</p>
              </div>
              <div className="border-r border-[#27272A]"></div>
              <div>
                <p className="text-[#A1A1AA] text-xs">مسؤولين</p>
                <p className="text-lg font-bold text-purple-400">
                  {users.filter(u => u.role === "admin").length}
                </p>
              </div>
              <div className="border-r border-[#27272A]"></div>
              <div>
                <p className="text-[#A1A1AA] text-xs">عملاء</p>
                <p className="text-lg font-bold text-blue-400">
                  {users.filter(u => u.role === "customer").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="px-4 space-y-3">
        {filteredUsers.length === 0 ? (
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-[#A1A1AA] mx-auto mb-2" />
              <p className="text-[#A1A1AA]">لا يوجد مستخدمين</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.user_id} className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* User Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#27272A] flex-shrink-0 bg-[#27272A] flex items-center justify-center">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <User className="h-8 w-8 text-[#A1A1AA]" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                    <p className="text-[#A1A1AA] text-sm break-all">{user.email}</p>
                    
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {/* Role Badge */}
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield className="h-3 w-3 ml-1" />
                            مسؤول
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 ml-1" />
                            عميل
                          </>
                        )}
                      </Badge>

                      {/* Blocked Badge */}
                      {user.isBlocked && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <Ban className="h-3 w-3 ml-1" />
                          محظور
                        </Badge>
                      )}

                      {/* Verified Badge */}
                      {user.isVerified && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          موثق
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {user.createdAt && (
                  <p className="text-[#A1A1AA] text-xs mb-3">
                    📅 انضم في {new Date(user.createdAt).toLocaleDateString("ar-QA")}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => navigate(`/admin/users/${user.user_id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#27272A] text-white hover:bg-[#27272A]"
                  >
                    <Eye className="ml-1 h-4 w-4" />
                    عرض
                  </Button>
                  
                  {user.user_id !== currentUser.user_id && (
                    <>
                      <Button
                        onClick={() => handleResetPassword(user.user_id, user.name)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      >
                        <Key className="ml-1 h-4 w-4" />
                        تغيير كلمة المرور
                      </Button>
                      
                      <Button
                        onClick={() => handleToggleAdmin(user.user_id, user.name, user.role)}
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${
                          user.role === "admin"
                            ? "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            : "border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                        }`}
                      >
                        <Shield className="ml-1 h-4 w-4" />
                        {user.role === "admin" ? "إزالة" : "منح"} الإدارة
                      </Button>
                      
                      <Button
                        onClick={() => handleToggleBlock(user.user_id, user.name, user.isBlocked)}
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${
                          user.isBlocked
                            ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        <Ban className="ml-1 h-4 w-4" />
                        {user.isBlocked ? "إلغاء الحظر" : "حظر"}
                      </Button>

                      <Button
                        onClick={() => handleDeleteUser(user.user_id, user.name)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="ml-1 h-4 w-4" />
                        حذف
                      </Button>
                    </>
                  )}
                </div>

                {/* Current User Notice */}
                {user.user_id === currentUser.user_id && (
                  <p className="text-[#D4AF37] text-xs text-center mt-2">أنت</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminUsersPage;
