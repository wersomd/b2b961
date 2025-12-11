import React, { useEffect, useState } from 'react';
import { Role, User } from '../../types';
import { db } from '../../services/mockDatabase';
import { Language, translations } from '../../i18n';
import { Trash2, UserPlus, Save, X, Edit, Search } from 'lucide-react';

interface Props {
  lang: Language;
}

const UserManagement: React.FC<Props> = ({ lang }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: Role.CLIENT,
    password: '',
    companyName: ''
  });

  const t = translations[lang];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    db.getAllUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await db.deleteUser(id);
      loadUsers();
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentUserData({ name: '', email: '', role: Role.CLIENT, password: '', companyName: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditMode(true);
    setCurrentUserData({ ...user }); // Copy user data
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode && currentUserData.id) {
        await db.updateUser(currentUserData.id, currentUserData);
    } else {
        await db.createUser(currentUserData);
    }
    
    setIsModalOpen(false);
    loadUsers();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.adminTitle}</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system access and permissions</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all font-medium"
        >
          <UserPlus size={20} />
          {t.addUser}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
                <tr>
                <th className="p-5 font-semibold">{t.name}</th>
                <th className="p-5 font-semibold">Email</th>
                <th className="p-5 font-semibold">{t.role}</th>
                <th className="p-5 font-semibold text-right">{t.actions}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            {user.companyName && <p className="text-xs text-slate-500 dark:text-slate-400">{user.companyName}</p>}
                        </div>
                    </div>
                    </td>
                    <td className="p-5 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${user.role === Role.ADMIN ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                        user.role === Role.SELLER ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        user.role === Role.DRIVER ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                        {translations[lang][`role${user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}` as keyof typeof t] || user.role}
                    </span>
                    </td>
                    <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 dark:border-slate-700 transform transition-all">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editMode ? 'Edit User' : t.addUser}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.name}</label>
                    <input 
                    required
                    value={currentUserData.name}
                    onChange={e => setCurrentUserData({...currentUserData, name: e.target.value})}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-gray-400"
                    />
                 </div>

                 {currentUserData.role === Role.CLIENT && (
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                        <input 
                        value={currentUserData.companyName || ''}
                        onChange={e => setCurrentUserData({...currentUserData, companyName: e.target.value})}
                        placeholder="Company Ltd."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                 )}

                 <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input 
                    required
                    type="email"
                    value={currentUserData.email}
                    onChange={e => setCurrentUserData({...currentUserData, email: e.target.value})}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-gray-400"
                    />
                 </div>

                 <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                    <input 
                    required={!editMode}
                    type="text"
                    value={currentUserData.password || ''}
                    onChange={e => setCurrentUserData({...currentUserData, password: e.target.value})}
                    placeholder={editMode ? "Leave empty to keep" : "Password"}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-gray-400"
                    />
                 </div>
                 
                 <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.role}</label>
                    <div className="relative">
                        <select 
                        value={currentUserData.role}
                        onChange={e => setCurrentUserData({...currentUserData, role: e.target.value as Role})}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                        >
                        <option value={Role.CLIENT}>Client</option>
                        <option value={Role.SELLER}>Manager (Seller)</option>
                        <option value={Role.DRIVER}>Driver</option>
                        <option value={Role.ADMIN}>Admin</option>
                        </select>
                        <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold shadow-lg shadow-brand-600/30 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;