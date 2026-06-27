import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { goeyToast } from 'goey-toast';
import ConfirmationDialog from '../../components/confirmationBox.jsx';
import {
    FaUserShield,
    FaUsers,
    FaCar,
    FaBan,
    FaCheckCircle,
    FaTimesCircle,
    FaTrashAlt,
    FaSearch,
    FaExternalLinkAlt,
    FaToggleOn,
    FaToggleOff,
    FaRegClock
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, token } = useAuth();
    const { isDark } = useTheme();

    // Data states
    const [users, setUsers] = useState([]);
    const [adverts, setAdverts] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingAdverts, setLoadingAdverts] = useState(true);

    // Filter/tab states
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'adverts'
    const [userSearch, setUserSearch] = useState('');
    const [advertSearch, setAdvertSearch] = useState('');

    // Dialog state for deleting ads
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false,
        adId: null,
        adTitle: ''
    });
    const [deletingLoading, setDeletingLoading] = useState(false);

    // Authorization headers
    const authHeaders = useMemo(() => {
        return token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {};
    }, [token]);

    // Safety checks for Admin role
    useEffect(() => {
        if (!token || !authUser) {
            navigate('/login', { replace: true });
            return;
        }
        if (!authUser.isAdmin) {
            goeyToast.error('Access Denied', {
                description: 'You do not have administrative privileges.'
            });
            navigate('/', { replace: true });
        }
    }, [authUser, navigate, token]);

    // Fetch all users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/user`, {
                headers: authHeaders
            });
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            goeyToast.error('Fetch Failed', {
                description: error.response?.data?.message || 'Could not load users list.'
            });
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch all advertisements
    const fetchAdverts = async () => {
        setLoadingAdverts(true);
        try {
            // Fetching a large page limit (e.g. 100) for admin overview simplicity
            const response = await axios.get(`${API_BASE_URL}/api/advertisement/advertisements?limit=100`, {
                headers: authHeaders
            });
            setAdverts(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Error fetching advertisements:', error);
            goeyToast.error('Fetch Failed', {
                description: error.response?.data?.message || 'Could not load advertisements.'
            });
        } finally {
            setLoadingAdverts(false);
        }
    };

    useEffect(() => {
        if (authUser?.isAdmin && token) {
            fetchUsers();
            fetchAdverts();
        }
    }, [authUser, token, authHeaders]);

    // Toggle user status (active/inactive)
    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/user/${userId}/toggle-status`,
                {},
                { headers: authHeaders }
            );
            
            // Update local state
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.UID === userId || u._id === userId
                        ? { ...u, isActive: !currentStatus }
                        : u
                )
            );
            
            goeyToast.success('Status Updated', {
                description: response.data?.message || `User status toggled successfully.`
            });
        } catch (error) {
            console.error('Error toggling user status:', error);
            goeyToast.error('Update Failed', {
                description: error.response?.data?.message || 'Could not update user status.'
            });
        }
    };

    // Toggle advertisement status (published/unpublished)
    const handleToggleAdvertStatus = async (adId, currentStatus) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/advertisement/advertisements/${adId}/toggle-status`,
                {},
                { headers: authHeaders }
            );

            // Update local state
            setAdverts((prevAdverts) =>
                prevAdverts.map((ad) =>
                    ad._id === adId
                        ? { ...ad, isActive: !currentStatus }
                        : ad
                )
            );

            goeyToast.success('Status Updated', {
                description: response.data?.message || `Advertisement status toggled successfully.`
            });
        } catch (error) {
            console.error('Error toggling advertisement status:', error);
            goeyToast.error('Update Failed', {
                description: error.response?.data?.message || 'Could not update advertisement status.'
            });
        }
    };

    // Trigger delete confirmation dialogue
    const openDeleteDialog = (adId, adTitle) => {
        setDeleteDialog({
            isOpen: true,
            adId,
            adTitle
        });
    };

    // Confirm deletion of advertisement
    const handleDeleteAdvert = async () => {
        if (!deleteDialog.adId) return;
        setDeletingLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/api/advertisement/advertisements/${deleteDialog.adId}`, {
                headers: authHeaders
            });

            // Update local state
            setAdverts((prevAdverts) => prevAdverts.filter((ad) => ad._id !== deleteDialog.adId));

            goeyToast.success('Deleted Successfully', {
                description: 'The advertisement listing has been permanently removed.'
            });
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            goeyToast.error('Deletion Failed', {
                description: error.response?.data?.message || 'Could not delete advertisement.'
            });
        } finally {
            setDeletingLoading(false);
            setDeleteDialog({ isOpen: false, adId: null, adTitle: '' });
        }
    };

    // Compute Metrics
    const metrics = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.isActive).length;
        const suspendedUsers = totalUsers - activeUsers;

        const totalAds = adverts.length;
        const publishedAds = adverts.filter((ad) => ad.isActive).length;
        const unpublishedAds = totalAds - publishedAds;

        return {
            totalUsers,
            activeUsers,
            suspendedUsers,
            totalAds,
            publishedAds,
            unpublishedAds
        };
    }, [users, adverts]);

    // Filter Users list
    const filteredUsers = useMemo(() => {
        const query = userSearch.toLowerCase().trim();
        if (!query) return users;
        return users.filter(
            (u) =>
                u.userName?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.phoneNum?.includes(query) ||
                u.UID?.toLowerCase().includes(query)
        );
    }, [users, userSearch]);

    // Filter Advertisements list
    const filteredAdverts = useMemo(() => {
        const query = advertSearch.toLowerCase().trim();
        if (!query) return adverts;
        return adverts.filter(
            (ad) =>
                ad.title?.toLowerCase().includes(query) ||
                ad.vehicleName?.toLowerCase().includes(query) ||
                ad.model?.toLowerCase().includes(query) ||
                ad.location?.toLowerCase().includes(query) ||
                ad.city?.toLowerCase().includes(query) ||
                ad.province?.toLowerCase().includes(query)
        );
    }, [adverts, advertSearch]);

    if (!authUser?.isAdmin) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-xl font-bold">!</div>
                    <h3 className="text-lg font-black">Verifying administrative access...</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Redirecting you if verification fails.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 text-warm-dark dark:text-slate-100">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-sand-200 dark:border-slate-800/80 pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 rounded-full px-3.5 py-1.5 shadow-sm">
                        <FaUserShield className="text-rose-500 text-xs" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                            Systems Control Panel
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
                        Admin Console
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        System-wide management of user accounts, listed advertisements, and database indices.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            fetchUsers();
                            fetchAdverts();
                        }}
                        className="bg-white dark:bg-slate-900 hover:bg-sand-100 dark:hover:bg-slate-800 border border-sand-300 dark:border-slate-700/60 text-xs font-bold px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                    >
                        Sync Databases
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {/* Metric User */}
                <div className="bg-white dark:bg-slate-900 border border-sand-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Accounts</span>
                        <FaUsers size={16} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-black">{metrics.totalUsers}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {metrics.activeUsers} Active • {metrics.suspendedUsers} Suspended
                    </div>
                </div>

                {/* Metric Ads */}
                <div className="bg-white dark:bg-slate-900 border border-sand-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Ad Listings</span>
                        <FaCar size={16} className="text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black">{metrics.totalAds}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {metrics.publishedAds} Published • {metrics.unpublishedAds} Drafts
                    </div>
                </div>

                {/* Metric Active Users Ratio */}
                <div className="bg-white dark:bg-slate-900 border border-sand-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">System Health</span>
                        <FaCheckCircle size={16} className="text-purple-500" />
                    </div>
                    <div className="text-2xl font-black">
                        {metrics.totalUsers ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 100}%
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Ratio of active users in database
                    </div>
                </div>

                {/* Metric Active Ads Ratio */}
                <div className="bg-white dark:bg-slate-900 border border-sand-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">Listing Volume</span>
                        <FaRegClock size={16} className="text-amber-500" />
                    </div>
                    <div className="text-2xl font-black">
                        {metrics.totalAds ? Math.round((metrics.publishedAds / metrics.totalAds) * 100) : 100}%
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Ratio of visible/active listings
                    </div>
                </div>
            </div>

            {/* Main Interface tabs */}
            <div className="bg-white dark:bg-slate-900 border border-sand-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
                {/* Tabs selection bar */}
                <div className="flex border-b border-sand-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 px-6 pt-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-4 text-xs font-black uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                            activeTab === 'users'
                                ? 'border-rose-500 text-rose-500'
                                : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <FaUsers />
                        Users Control ({filteredUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('adverts')}
                        className={`pb-4 px-4 text-xs font-black uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                            activeTab === 'adverts'
                                ? 'border-rose-500 text-rose-500'
                                : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <FaCar />
                        Advertisements Control ({filteredAdverts.length})
                    </button>
                </div>

                {/* Tab content panel */}
                <div className="p-6">
                    {/* Tab 1: Users Control */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Search bar */}
                            <div className="relative max-w-md">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                    type="text"
                                    placeholder="Search by Username, Email, Phone or UID..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-sand-100/50 dark:bg-slate-950/40 border border-sand-300 dark:border-slate-800 text-xs rounded-2xl outline-none focus:border-rose-500 focus:bg-white focus:dark:bg-slate-950 transition"
                                />
                            </div>

                            {/* Users Table */}
                            {loadingUsers ? (
                                <div className="space-y-3 py-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-14 bg-slate-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                                    No accounts matched the search filter.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-sand-200 dark:border-slate-800 text-slate-400 uppercase tracking-widest font-black text-[10px]">
                                                <th className="pb-3 pl-2">User Details</th>
                                                <th className="pb-3">UID</th>
                                                <th className="pb-3">Phone</th>
                                                <th className="pb-3">Role</th>
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3 text-right pr-2">Control Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-sand-100 dark:divide-slate-800/40">
                                            {filteredUsers.map((userDoc) => (
                                                <tr key={userDoc._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                                                    {/* Profile */}
                                                    <td className="py-4 pl-2 flex items-center gap-3">
                                                        <img
                                                            src={userDoc.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                                                            alt={userDoc.userName}
                                                            className="w-9 h-9 rounded-full object-cover border border-sand-200 dark:border-slate-800"
                                                        />
                                                        <div>
                                                            <div className="font-black text-slate-800 dark:text-slate-100 group-hover:text-rose-500 transition-colors">
                                                                {userDoc.userName}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-semibold">{userDoc.email}</div>
                                                        </div>
                                                    </td>
                                                    {/* UID */}
                                                    <td className="py-4 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                                        {userDoc.UID || 'N/A'}
                                                    </td>
                                                    {/* Phone */}
                                                    <td className="py-4 font-semibold text-slate-500 dark:text-slate-400">
                                                        {userDoc.phoneNum}
                                                    </td>
                                                    {/* Role */}
                                                    <td className="py-4">
                                                        {userDoc.isAdmin ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-[9px] uppercase tracking-wider">
                                                                Admin
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                                                User
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* Status */}
                                                    <td className="py-4">
                                                        {userDoc.isActive ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                                <FaCheckCircle className="text-[8px]" /> Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                                                                <FaBan className="text-[8px]" /> Suspended
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="py-4 text-right pr-2">
                                                        {userDoc._id === authUser._id ? (
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-550 italic font-semibold">
                                                                Self Account
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleUserStatus(userDoc.UID || userDoc._id, userDoc.isActive)}
                                                                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition duration-250 cursor-pointer ${
                                                                    userDoc.isActive
                                                                        ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                                                                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-250 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                                                }`}
                                                            >
                                                                {userDoc.isActive ? <FaToggleOn size={13} /> : <FaToggleOff size={13} />}
                                                                {userDoc.isActive ? 'Suspend' : 'Activate'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Advertisements Control */}
                    {activeTab === 'adverts' && (
                        <div className="space-y-6">
                            {/* Search bar */}
                            <div className="relative max-w-md">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                    type="text"
                                    placeholder="Search by Title, Vehicle Name, Model or Location..."
                                    value={advertSearch}
                                    onChange={(e) => setAdvertSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-sand-100/50 dark:bg-slate-950/40 border border-sand-300 dark:border-slate-800 text-xs rounded-2xl outline-none focus:border-rose-500 focus:bg-white focus:dark:bg-slate-950 transition"
                                />
                            </div>

                            {/* Advertisements Table */}
                            {loadingAdverts ? (
                                <div className="space-y-3 py-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-14 bg-slate-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredAdverts.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                                    No advertisements matched the search filter.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-sand-200 dark:border-slate-800 text-slate-400 uppercase tracking-widest font-black text-[10px]">
                                                <th className="pb-3 pl-2">Vehicle Details</th>
                                                <th className="pb-3">Location</th>
                                                <th className="pb-3">Pricing (LKR)</th>
                                                <th className="pb-3">Owner UID</th>
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3 text-right pr-2">Control Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-sand-100 dark:divide-slate-800/40">
                                            {filteredAdverts.map((ad) => (
                                                <tr key={ad._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                                                    {/* Image & Title */}
                                                    <td className="py-4 pl-2 flex items-center gap-3">
                                                        <img
                                                            src={ad.images?.[0] || 'https://placehold.co/600x400?text=Vehicle+Image'}
                                                            alt={ad.title}
                                                            className="w-12 h-9 rounded-lg object-cover border border-sand-200 dark:border-slate-800"
                                                        />
                                                        <div>
                                                            <div className="font-black text-slate-800 dark:text-slate-100 group-hover:text-rose-500 transition-colors max-w-xs truncate">
                                                                {ad.title}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                {ad.vehicleName} {ad.model} • {ad.ManufactureYear || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Location */}
                                                    <td className="py-4 font-semibold text-slate-500 dark:text-slate-400">
                                                        {ad.city ? `${ad.city}, ${ad.district || ''}` : ad.location || 'N/A'}
                                                    </td>
                                                    {/* Price */}
                                                    <td className="py-4">
                                                        <div className="font-black text-slate-800 dark:text-slate-100">
                                                            LKR {new Intl.NumberFormat('en-LK').format(ad.price)}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                                                            ML Val: LKR {ad.predictedPrice ? new Intl.NumberFormat('en-LK').format(ad.predictedPrice) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    {/* Owner UID */}
                                                    <td className="py-4 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                                        {ad.userId || 'N/A'}
                                                    </td>
                                                    {/* Status */}
                                                    <td className="py-4">
                                                        {ad.isActive ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                                <FaCheckCircle className="text-[8px]" /> Published
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                                                <FaTimesCircle className="text-[8px]" /> Draft
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* Control Actions */}
                                                    <td className="py-4 text-right pr-2">
                                                        <div className="inline-flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleAdvertStatus(ad._id, ad.isActive)}
                                                                className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition duration-250 cursor-pointer ${
                                                                    ad.isActive
                                                                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400'
                                                                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-250 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                                                }`}
                                                            >
                                                                {ad.isActive ? <FaToggleOn size={12} /> : <FaToggleOff size={12} />}
                                                                {ad.isActive ? 'Unpublish' : 'Publish'}
                                                            </button>

                                                            <a
                                                                href={`/advertisement/${ad._id}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 border border-transparent hover:border-sand-300 dark:hover:border-slate-700 transition"
                                                                title="View Listing Details"
                                                            >
                                                                <FaExternalLinkAlt size={10} />
                                                            </a>

                                                            <button
                                                                onClick={() => openDeleteDialog(ad._id, ad.title)}
                                                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 hover:text-rose-700 border border-transparent dark:border-rose-900/25 hover:border-rose-250 transition cursor-pointer"
                                                                title="Delete Listing"
                                                            >
                                                                <FaTrashAlt size={10} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation dialogue for deleting ads */}
            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, adId: null, adTitle: '' })}
                onConfirm={handleDeleteAdvert}
                title="Delete Advertisement"
                message={`Are you sure you want to permanently delete the advertisement listing "${deleteDialog.adTitle}"? This process cannot be undone.`}
                confirmText="Yes, Delete Ad"
                cancelText="Cancel"
                type="danger"
                isDarkMode={isDark}
                loading={deletingLoading}
            />
        </div>
    );
};

export default AdminDashboard;
