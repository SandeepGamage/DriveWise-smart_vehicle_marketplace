import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';

const variantConfig = {
	danger: {
		icon: AlertTriangle,
		iconClassName: 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/15',
		confirmClassName: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500/30',
	},
	warning: {
		icon: ShieldAlert,
		iconClassName: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/15',
		confirmClassName: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500/30',
	},
	success: {
		icon: CheckCircle2,
		iconClassName: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/15',
		confirmClassName: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/30',
	},
	info: {
		icon: Info,
		iconClassName: 'bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/15',
		confirmClassName: 'bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-500/30',
	},
};

const ConfirmationDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	type = 'danger',
	isDarkMode = false,
	loading = false,
	confirmDisabled = false,
	showCloseButton = true,
	children,
	className = '',
}) => {
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				onClose?.();
			}
		};

		window.addEventListener('keydown', handleEscape);

		return () => window.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	if (!isOpen || typeof document === 'undefined') {
		return null;
	}

	const selectedVariant = variantConfig[type] || variantConfig.info;
	const Icon = selectedVariant.icon;

	const handleConfirm = async () => {
		if (confirmDisabled || loading) {
			return;
		}

		await onConfirm?.();
		onClose?.();
	};

	const dialog = (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="presentation"
			onClick={onClose}
		>
			<div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" />

			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirmation-dialog-title"
				aria-describedby="confirmation-dialog-message"
				className={`relative w-full max-w-115 overflow-hidden rounded-4xl border shadow-[0_30px_80px_rgba(15,23,42,0.35)] ${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-sand-300 bg-white text-warm-dark'} ${className}`}
				onClick={(event) => event.stopPropagation()}
			>
				<div className={`flex items-start gap-4 border-b p-6 ${isDarkMode ? 'border-slate-700 bg-slate-950/35' : 'border-sand-200 bg-sand-50/70'}`}>
					<div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${selectedVariant.iconClassName}`}>
						<Icon size={28} strokeWidth={2.4} />
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h3 id="confirmation-dialog-title" className={`text-xl font-black tracking-tight sm:text-2xl ${isDarkMode ? 'text-white' : 'text-warm-dark'}`}>
									{title}
								</h3>
								<p id="confirmation-dialog-message" className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
									{message}
								</p>
							</div>

							{showCloseButton && (
								<button
									type="button"
									onClick={onClose}
									className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-accent/40 ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-sand-100 hover:text-warm-dark'}`}
									aria-label="Close dialog"
								>
									<X size={18} />
								</button>
							)}
						</div>
					</div>
				</div>

				{children && (
					<div className={`px-6 pt-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
						{children}
					</div>
				)}

				<div className={`flex flex-col gap-3 p-6 pt-5 sm:flex-row ${isDarkMode ? 'bg-slate-950/20' : 'bg-sand-50/60'}`}>
					<button
						type="button"
						onClick={onClose}
						className={`inline-flex flex-1 items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500/30' : 'border-sand-300 bg-white text-warm-dark hover:bg-sand-100 focus-visible:ring-sand-400/30'}`}
					>
						{cancelText}
					</button>

					<button
						type="button"
						onClick={handleConfirm}
						disabled={confirmDisabled || loading}
						className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-black text-white shadow-lg transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${selectedVariant.confirmClassName}`}
					>
						{loading ? 'Working...' : confirmText}
					</button>
				</div>
			</div>
		</div>
	);

	return ReactDOM.createPortal(dialog, document.body);
};

export default ConfirmationDialog;
