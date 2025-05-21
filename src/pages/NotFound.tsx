
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-[#212529] dark:to-[#343a40] p-4">
      <div className="text-center bg-white dark:bg-[#343a40] p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-[#ff4d6d]/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-[#ff4d6d]">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-[#212529] dark:text-white">Page not found</h1>
        
        <p className="text-lg text-[#6c757d] dark:text-[#adb5bd] mb-8">
          Oops! We couldn't find the page you're looking for.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex px-6 py-3 text-white font-medium bg-[#25a18e] hover:bg-[#1e8a77] rounded-md transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
