import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AdvertisementCard from '../../components/AdvertisementCard';
import ConfirmationDialog from '../../components/confirmationBox.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
	FaArrowRight,
	FaCar,
	FaEnvelope,
	FaExclamationTriangle,
	FaImage,
	FaMoon,
	FaPhone,
	FaRegClock,
	FaSave,
	FaSignOutAlt,
	FaSun,
	FaTrashAlt,
	FaUserCircle,
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DASHBOARD_THEME_KEY = 'drivewise_dashboard_theme';

const readStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem('drivewise_user') || 'null');
	} catch {
		return null;
	}
};

const formatCurrency = (value) =>
	new Intl.NumberFormat('en-LK', {
		maximumFractionDigits: 0,
	}).format(Number(value || 0));

const UserDashboard = () => {
	const navigate = useNavigate();
	const { user: authUser, logout: contextLogout, refreshUser: contextRefreshUser } = useAuth();
	const { isDark, toggleTheme } = useTheme();
	const [currentUser, setCurrentUser] = useState(authUser || readStoredUser());
	const [myAds, setMyAds] = useState([]);
	const [loadingAds, setLoadingAds] = useState(true);
	const [savingProfile, setSavingProfile] = useState(false);
	const [busyAction, setBusyAction] = useState(false);
	const [pageError, setPageError] = useState('');
	const [pageMessage, setPageMessage] = useState('');
	const [profileFile, setProfileFile] = useState(null);
	const [profileForm, setProfileForm] = useState({
		userName: currentUser?.userName || '',
		email: currentUser?.email || '',
		phoneNum: currentUser?.phoneNum || '',
		password: '',
	});
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		title: '',
		message: '',
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		type: 'danger',
		onConfirm: null,
	});
	const [confirmLoading, setConfirmLoading] = useState(false);

	const token = localStorage.getItem('drivewise_token');

	useEffect(() => {
		if (authUser) {
			setCurrentUser(authUser);
			setProfileForm({
				userName: authUser.userName || '',
				email: authUser.email || '',
				phoneNum: authUser.phoneNum || '',
				password: '',
			});
		}
	}, [authUser]);

	const authHeaders = useMemo(() => {
		return token
			? {
				Authorization: `Bearer ${token}`,
			}
			: {};
	}, [token]);

	const refreshStoredUser = (nextUser) => {
		if (!nextUser) {
			return;
		}
		contextRefreshUser(nextUser);
	};

	useEffect(() => {
		if (!token || !currentUser) {
			navigate('/login', { replace: true });
		}
	}, [currentUser, navigate, token]);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!token) {
				return;
			}

			try {
				const response = await axios.get(`${API_BASE_URL}/api/user/me`, {
					headers: authHeaders,
				});

				refreshStoredUser(response.data?.user || response.data);
			} catch (error) {
				if (error.response?.status === 401 || error.response?.status === 403) {
					localStorage.removeItem('drivewise_token');
					localStorage.removeItem('drivewise_user');
					navigate('/login', { replace: true });
					return;
				}

				setPageError(error.response?.data?.message || 'Could not load your profile.');
			}
		};

		fetchProfile();
	}, [authHeaders, navigate, token]);

	useEffect(() => {
		const fetchMyAdvertisements = async () => {
			if (!currentUser) {
				return;
			}

			setLoadingAds(true);
			setPageError('');

			const userIdentifiers = [currentUser.UID, currentUser._id].filter(Boolean);
			let allLoadedAds = [];

			try {
				for (const userIdentifier of userIdentifiers) {
					try {
						const response = await axios.get(
							`${API_BASE_URL}/api/advertisement/advertisements/user/${userIdentifier}`,
							{ params: { page: 1, limit: 100 } }
						);

						if (response.data?.success && response.data.data?.length > 0) {
							const newAds = response.data.data.filter(
								(newAd) => !allLoadedAds.some((loadedAd) => (loadedAd._id || loadedAd.id) === (newAd._id || newAd.id))
							);
							allLoadedAds = [...allLoadedAds, ...newAds];
						}
					} catch (err) {
						console.warn("Failed fetching ads for identifier:", userIdentifier, err.message);
					}
				}

				setMyAds(allLoadedAds);
			} catch (error) {
				setPageError(error.response?.data?.message || 'Could not load your advertisements.');
				setMyAds([]);
			} finally {
				setLoadingAds(false);
			}
		};

		fetchMyAdvertisements();
	}, [currentUser]);

	const stats = useMemo(() => {
		const totalAds = myAds.length;
		const activeAds = myAds.filter((ad) => ad.isActive).length;
		const totalValue = myAds.reduce((sum, ad) => sum + Number(ad.price || 0), 0);
		const avgMileage = totalAds > 0 ? Math.round(myAds.reduce((sum, ad) => sum + Number(ad.mileage || 0), 0) / totalAds) : 0;

		return { totalAds, activeAds, totalValue, avgMileage };
	}, [myAds]);

	const handleLogout = () => {
		setConfirmDialog({
			isOpen: true,
			title: 'Confirm Logout',
			message: 'Are you sure you want to log out of your DriveWise account?',
			confirmText: 'Logout',
			cancelText: 'Cancel',
			type: 'warning',
			onConfirm: () => {
				contextLogout();
				navigate('/login', { replace: true });
			},
		});
	};

	const handleProfileChange = (event) => {
		const { name, value } = event.target;
		setProfileForm((previous) => ({ ...previous, [name]: value }));
	};

	const handleProfileUpdate = async (event) => {
		event.preventDefault();
		setSavingProfile(true);
		setPageError('');
		setPageMessage('');

		try {
			const payload = new FormData();
			payload.append('userName', profileForm.userName.trim());
			payload.append('email', profileForm.email.trim());
			payload.append('phoneNum', profileForm.phoneNum.trim());

			if (profileForm.password.trim()) {
				payload.append('password', profileForm.password.trim());
			}

			if (profileFile) {
				payload.append('profilePic', profileFile);
			}

			const response = await axios.put(`${API_BASE_URL}/api/user/me`, payload, {
				headers: authHeaders,
			});

			const updatedUser = response.data?.user || currentUser;
			refreshStoredUser(updatedUser);
			setProfileFile(null);
			setPageMessage(response.data?.message || 'Profile updated successfully.');
		} catch (error) {
			setPageError(error.response?.data?.message || 'Unable to update profile.');
		} finally {
			setSavingProfile(false);
		}
	};

	const handleDeleteProfile = () => {
		setConfirmDialog({
			isOpen: true,
			title: 'Delete Profile',
			message: 'Delete your profile and all of your advertisements? This action cannot be undone.',
			confirmText: 'Delete Profile',
			cancelText: 'Cancel',
			type: 'danger',
			onConfirm: async () => {
				setConfirmLoading(true);
				setBusyAction(true);
				setPageError('');

				try {
					await axios.patch(`${API_BASE_URL}/api/user/${currentUser.UID}`, {
						headers: authHeaders,
					});

					contextLogout();
					navigate('/login', { replace: true });
				} catch (error) {
					setPageError(error.response?.data?.message || 'Unable to delete profile.');
				} finally {
					setBusyAction(false);
					setConfirmLoading(false);
				}
			},
		});
	};

	const handleDeleteAd = (adId) => {
		setConfirmDialog({
			isOpen: true,
			title: 'Remove Listing',
			message: 'Are you sure you want to remove this listing from your account?',
			confirmText: 'Delete Listing',
			cancelText: 'Cancel',
			type: 'danger',
			onConfirm: async () => {
				setConfirmLoading(true);
				setPageError('');
				setPageMessage('');
				try {
					await axios.delete(`${API_BASE_URL}/api/advertisement/advertisements/${adId}`, {
						headers: authHeaders
					});
					setMyAds((previous) => previous.filter((ad) => (ad._id || ad.id || ad.addId) !== adId));
					setPageMessage('Listing removed successfully.');
				} catch (error) {
					setPageError(error.response?.data?.message || 'Unable to delete the listing.');
				} finally {
					setConfirmLoading(false);
				}
			},
		});
	};

	const handleToggleStatus = async (adId) => {
		setPageError('');
		setPageMessage('');
		try {
			const response = await axios.patch(
				`${API_BASE_URL}/api/advertisement/advertisements/${adId}/toggle-status`,
				{},
				{ headers: authHeaders }
			);
			if (response.data.success) {
				const updatedAd = response.data.data;
				setMyAds((previous) =>
					previous.map((ad) => ((ad._id || ad.id || ad.addId) === adId ? { ...ad, isActive: updatedAd.isActive } : ad))
				);
				setPageMessage(response.data.message || 'Listing publish status toggled successfully.');
			}
		} catch (error) {
			setPageError(error.response?.data?.message || 'Unable to update publish status.');
		}
	};

	if (!currentUser) {
		return null;
	}

	const theme = isDark
		? {
			page: 'text-slate-100',
			surface: 'border-slate-700/70 bg-slate-900 shadow-[0_18px_50px_rgba(2,6,23,0.45)]',
			soft: 'border-slate-700 bg-slate-800/80',
			textMuted: 'text-slate-400',
			textPrimary: 'text-slate-100',
			headline: 'text-slate-50',
			heroCard: 'border-slate-700/70 bg-slate-950 text-slate-100',
			accentBtn: 'bg-warm-accent text-warm-dark hover:bg-warm-accent-hover',
			secondaryBtn: 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700',
			input: 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-warm-accent',
			badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
			sectionLabel: 'text-slate-400',
			emptyBox: 'border-slate-700 bg-slate-900',
		}
		: {
			page: 'text-warm-dark',
			surface: 'border-sand-300/60 bg-white shadow-sm',
			soft: 'border-sand-200/70 bg-sand-100',
			textMuted: 'text-slate-500',
			textPrimary: 'text-warm-dark',
			headline: 'text-warm-dark',
			heroCard: 'border-sand-300/60 bg-warm-dark text-white',
			accentBtn: 'bg-warm-accent text-warm-dark hover:bg-warm-accent-hover',
			secondaryBtn: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
			input: 'border-sand-300/60 bg-sand-100 text-warm-dark placeholder:text-slate-400 focus:border-warm-accent',
			badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
			sectionLabel: 'text-slate-400',
			emptyBox: 'border-sand-300 bg-white',
		};

	return (
		<div className={`relative space-y-8 rounded-4xl p-2 pb-16 transition-colors duration-300 ${theme.page}`}>
			<section className={`overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 lg:p-10 ${theme.surface}`}>
				<div className="grid gap-8 lg:grid-cols-12 lg:items-center">
					<div className="space-y-6 lg:col-span-7">
						<div className="flex flex-wrap items-center gap-3">
							<div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${theme.soft} ${theme.sectionLabel}`}>
								<span className="h-2 w-2 rounded-full bg-warm-accent animate-pulse" />
								Account control center
							</div>
							<button
								type="button"
								onClick={toggleTheme}
								className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${theme.soft} ${theme.textPrimary}`}
							>
								{isDark ? <FaSun className="text-amber-300" /> : <FaMoon className="text-slate-500" />}
								{isDark ? 'Light mode' : 'Dark mode'}
							</button>
						</div>

						<div className="space-y-3">
							<h1 className={`text-4xl font-black tracking-tight sm:text-5xl ${theme.headline}`}>
								Welcome back, {currentUser.userName || 'Driver'}
								<span className="ml-2 inline-block text-warm-accent">✴</span>
							</h1>
							<p className={`max-w-2xl text-sm leading-relaxed sm:text-base ${theme.textMuted}`}>
								Review your listings, update your account details, and keep your profile current without leaving the DriveWise interface.
							</p>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className={`rounded-3xl border p-4 ${theme.soft}`}>
								<span className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Listings</span>
								<div className={`mt-2 text-2xl font-black ${theme.textPrimary}`}>{stats.totalAds}</div>
								<p className={`mt-1 text-[11px] font-semibold ${theme.textMuted}`}>Your total advertisements</p>
							</div>
							<div className={`rounded-3xl border p-4 ${theme.soft}`}>
								<span className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Active</span>
								<div className={`mt-2 text-2xl font-black ${theme.textPrimary}`}>{stats.activeAds}</div>
								<p className={`mt-1 text-[11px] font-semibold ${theme.textMuted}`}>Currently visible ads</p>
							</div>
						</div>
					</div>

					<div className="lg:col-span-5">
						<div className={`rounded-4xl border p-5 shadow-xl sm:p-6 ${theme.heroCard}`}>
							<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
								<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/10">
									{currentUser.profilePic ? (
										<img src={currentUser.profilePic} alt={currentUser.userName || 'Profile'} className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/80">
											{currentUser.userName?.slice(0, 1)?.toUpperCase() || 'D'}
										</div>
									)}
								</div>

								<div className="min-w-0 flex-1 space-y-3">
									<div>
										<h2 className="text-2xl font-black tracking-tight text-white">{currentUser.userName || 'DriveWise member'}</h2>
										<p className="mt-1 text-sm text-slate-300">{currentUser.email}</p>
									</div>

									<div className="space-y-2 text-sm text-slate-300">
										<div className="flex items-center gap-2">
											<FaPhone className="text-warm-accent" />
											<span>{currentUser.phoneNum || 'No phone number saved'}</span>
										</div>
										<div className="flex items-center gap-2">
											<FaCar className="text-warm-accent" />
											<span>{stats.totalAds > 0 ? 'Seller account active' : 'Ready to create your first listing'}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-6 flex flex-wrap gap-3">
								<button
									type="button"
									onClick={handleLogout}
									className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-widest transition ${theme.accentBtn}`}
								>
									<FaSignOutAlt className="text-[10px]" />
									Logout
								</button>
								<button
									type="button"
									onClick={handleDeleteProfile}
									disabled={busyAction}
									className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.secondaryBtn}`}
								>
									<FaTrashAlt className="text-[10px]" />
									{busyAction ? 'Deleting...' : 'Delete profile'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{(pageError || pageMessage) && (
				<div
					className={`flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-sm ${pageError
						? 'border-rose-300/50 bg-rose-500/10 text-rose-300'
						: isDark
							? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
							: 'border-emerald-200 bg-emerald-50 text-emerald-700'
						}`}
				>
					<FaExclamationTriangle className="mt-0.5 shrink-0 text-sm" />
					<p>{pageError || pageMessage}</p>
				</div>
			)}

			<div className="grid gap-8 lg:grid-cols-12">
				<section className={`rounded-4xl border p-6 lg:col-span-5 sm:p-7 ${theme.surface}`}>
					<div className={`flex items-center justify-between gap-4 border-b pb-5 ${isDark ? 'border-slate-700' : 'border-sand-200'}`}>
						<div>
							<p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.sectionLabel}`}>Profile summary</p>
							<h2 className={`mt-1 text-2xl font-black tracking-tight ${theme.textPrimary}`}>Your details</h2>
						</div>
						<div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${theme.badge}`}>
							Verified account
						</div>
					</div>

					<div className="mt-6 space-y-4 text-sm">
						<div className={`flex items-center gap-3 rounded-2xl border p-4 ${theme.soft}`}>
							<FaUserCircle className="text-2xl text-warm-accent" />
							<div>
								<p className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Username</p>
								<p className={`font-semibold ${theme.textPrimary}`}>{currentUser.userName || 'Not set'}</p>
							</div>
						</div>
						<div className={`flex items-center gap-3 rounded-2xl border p-4 ${theme.soft}`}>
							<FaEnvelope className="text-warm-accent" />
							<div>
								<p className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Email</p>
								<p className={`font-semibold ${theme.textPrimary}`}>{currentUser.email || 'Not set'}</p>
							</div>
						</div>
						<div className={`flex items-center gap-3 rounded-2xl border p-4 ${theme.soft}`}>
							<FaPhone className="text-warm-accent" />
							<div>
								<p className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Phone</p>
								<p className={`font-semibold ${theme.textPrimary}`}>{currentUser.phoneNum || 'Not set'}</p>
							</div>
						</div>
						<div className={`flex items-center gap-3 rounded-2xl border p-4 ${theme.soft}`}>
							<FaRegClock className="text-warm-accent" />
							<div>
								<p className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Member since</p>
								<p className={`font-semibold ${theme.textPrimary}`}>{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Not available'}</p>
							</div>
						</div>
					</div>
				</section>

				<section className={`rounded-4xl border p-6 lg:col-span-7 sm:p-7 ${theme.surface}`}>
					<div className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-slate-700' : 'border-sand-200'}`}>
						<div>
							<p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.sectionLabel}`}>Edit profile</p>
							<h2 className={`mt-1 text-2xl font-black tracking-tight ${theme.textPrimary}`}>Update your account</h2>
						</div>

						<Link
							to="/create-ad"
							className="inline-flex items-center justify-center gap-2 rounded-full bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark px-5 py-3 text-xs font-black uppercase tracking-widest transition shadow-md"
						>
							<FaArrowRight className="text-[10px]" />
							Create ad
						</Link>
					</div>

					<form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className={`mb-2 block text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Username</label>
								<input
									type="text"
									name="userName"
									value={profileForm.userName}
									onChange={handleProfileChange}
									className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${theme.input}`}
									placeholder="Your display name"
								/>
							</div>
							<div>
								<label className={`mb-2 block text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Email</label>
								<input
									type="email"
									name="email"
									value={profileForm.email}
									onChange={handleProfileChange}
									className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${theme.input}`}
									placeholder="you@example.com"
								/>
							</div>
							<div>
								<label className={`mb-2 block text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Phone number</label>
								<input
									type="tel"
									name="phoneNum"
									value={profileForm.phoneNum}
									onChange={handleProfileChange}
									className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${theme.input}`}
									placeholder="0771234567"
								/>
							</div>
							<div>
								<label className={`mb-2 block text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>New password</label>
								<input
									type="password"
									name="password"
									value={profileForm.password}
									onChange={handleProfileChange}
									className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${theme.input}`}
									placeholder="Leave blank to keep current password"
								/>
							</div>
						</div>

						<label className="block space-y-2">
							<span className={`text-[10px] font-black uppercase tracking-widest ${theme.sectionLabel}`}>Profile picture</span>
							<div className={`rounded-2xl border border-dashed px-4 py-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-sand-300 bg-sand-100/70'}`}>
								<input
									type="file"
									accept="image/*"
									onChange={(event) => setProfileFile(event.target.files?.[0] || null)}
									className={`block w-full text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'} file:mr-4 file:rounded-full file:border-0 file:bg-warm-dark file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-warm-dark-card`}
								/>
								<p className={`mt-2 flex items-center gap-2 text-[11px] font-medium ${theme.textMuted}`}>
									<FaImage className={isDark ? 'text-slate-500' : 'text-slate-400'} />
									{profileFile ? profileFile.name : 'PNG, JPG, WEBP recommended'}
								</p>
							</div>
						</label>

						<button
							type="submit"
							disabled={savingProfile}
							className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark px-5 py-3.5 text-xs font-black uppercase tracking-widest transition shadow-md disabled:cursor-not-allowed disabled:opacity-60"
						>
							<FaSave className="text-[10px]" />
							{savingProfile ? 'Saving changes...' : 'Save changes'}
						</button>
					</form>
				</section>
			</div>

			<section className="space-y-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.sectionLabel}`}>Your listings</p>
						<h2 className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${theme.textPrimary}`}>Managed advertisements</h2>
					</div>
					<Link
						to="/create-ad"
						className={`inline-flex items-center gap-2 self-start rounded-full border px-5 py-3 text-xs font-black uppercase tracking-widest shadow-sm transition ${isDark ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-sand-300/70 bg-white text-warm-dark hover:bg-sand-100'}`}
					>
						Add new listing
						<FaArrowRight className="text-[10px]" />
					</Link>
				</div>

				{loadingAds ? (
					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{[...Array(3)].map((_, index) => (
							<div key={index} className={`h-105 animate-pulse rounded-4xl border shadow-sm ${theme.surface}`} />
						))}
					</div>
				) : myAds.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{myAds.map((ad) => {
							const adId = ad._id || ad.id || ad.addId;

							return (
								<AdvertisementCard
									key={adId}
									ad={ad}
									onDelete={handleDeleteAd}
									onToggleStatus={handleToggleStatus}
								/>
							);
						})}
					</div>
				) : (
					<div className={`rounded-[2.5rem] border border-dashed p-8 text-center shadow-sm sm:p-12 ${theme.emptyBox}`}>
						<div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-warm-accent ${isDark ? 'bg-slate-800' : 'bg-sand-100'}`}>
							<FaCar className="text-2xl" />
						</div>
						<h3 className={`mt-5 text-2xl font-black tracking-tight ${theme.textPrimary}`}>No listings yet</h3>
						<p className={`mx-auto mt-3 max-w-xl text-sm leading-relaxed ${theme.textMuted}`}>
							Create your first advertisement to start tracking performance, pricing, and marketplace visibility from this dashboard.
						</p>
						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
							<Link
								to="/create-ad"
								className="inline-flex items-center justify-center gap-2 rounded-full bg-warm-dark dark:bg-warm-accent hover:bg-warm-dark-card dark:hover:bg-warm-accent-hover text-white dark:text-warm-dark px-5 py-3 text-xs font-black uppercase tracking-widest transition shadow-md"
							>
								Create advertisement
								<FaArrowRight className="text-[10px]" />
							</Link>
							<button
								type="button"
								onClick={handleLogout}
								className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-xs font-black uppercase tracking-widest transition ${isDark ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-sand-300/70 bg-white text-warm-dark hover:bg-sand-100'}`}
							>
								Logout
							</button>
						</div>
					</div>
				)}
			</section>

			<ConfirmationDialog
				isOpen={confirmDialog.isOpen}
				onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
				onConfirm={confirmDialog.onConfirm}
				title={confirmDialog.title}
				message={confirmDialog.message}
				confirmText={confirmDialog.confirmText}
				cancelText={confirmDialog.cancelText}
				type={confirmDialog.type}
				isDarkMode={isDark}
				loading={confirmLoading}
			/>
		</div>
	);
};

export default UserDashboard;
