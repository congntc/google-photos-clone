import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome to Google Photos Clone" />
            
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        {/* Logo and Title */}
                        <div className="mb-8">
                            <div className="google-wordmark inline-flex text-6xl font-bold mb-4" aria-label="Google">
                                <span className="text-blue-500">G</span>
                                <span className="text-red-500">o</span>
                                <span className="text-yellow-500">o</span>
                                <span className="text-blue-500">g</span>
                                <span className="text-green-500">l</span>
                                <span className="text-red-500">e</span>
                            </div>
                            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Photos Clone
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Quản lý ảnh của bạn một cách thông minh và dễ dàng. 
                                Tải lên, tổ chức và chia sẻ kỷ niệm của bạn.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            {auth.user ? (
                                <Link
                                    href="/photos"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                    Xem ảnh của bạn
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                    >
                                        Tạo tài khoản
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                            <FeatureCard
                                icon="📸"
                                title="Tải lên không giới hạn"
                                description="Upload ảnh của bạn dễ dàng và nhanh chóng với chất lượng cao"
                            />
                            <FeatureCard
                                icon="📁"
                                title="Tổ chức thông minh"
                                description="Tạo albums, thêm tags và tìm kiếm ảnh một cách dễ dàng"
                            />
                            <FeatureCard
                                icon="🔗"
                                title="Chia sẻ an toàn"
                                description="Chia sẻ albums với bạn bè và gia đình một cách an toàn"
                            />
                        </div>

                        {/* Tech Stack */}
                        <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                                Được xây dựng với công nghệ hiện đại
                            </h2>
                            <div className="flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-400">
                                <TechBadge>Laravel 12</TechBadge>
                                <TechBadge>React 19</TechBadge>
                                <TechBadge>Inertia.js</TechBadge>
                                <TechBadge>Tailwind CSS</TechBadge>
                                <TechBadge>Shadcn UI</TechBadge>
                                <TechBadge>Vite</TechBadge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
                {description}
            </p>
        </div>
    );
}

function TechBadge({ children }) {
    return (
        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
            {children}
        </span>
    );
}
