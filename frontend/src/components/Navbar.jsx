import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-slate-800 p-4 border-b border-slate-700 flex gap-4 text-white">
            <Link to="/dashboard" className="hover:text-blue-400 font-medium">Browse Cars</Link>
            <Link to="/create-ad" className="bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all font-medium">
                + Sell Car
            </Link>
        </nav>
    );
};