import React from 'react';

const AccessDenied = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m1-4a3 3 0 100-6 3 3 0 000 6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Quyền truy cập bị từ chối</h2>
            <p className="text-gray-600 max-w-md">
                Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cần truy cập.
            </p>
        </div>
    );
};

export default AccessDenied;