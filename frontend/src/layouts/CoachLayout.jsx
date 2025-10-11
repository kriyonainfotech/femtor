import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import CoachSidebar from '../components/sidebars/CoachSidebar'; // Use the Coach sidebar

const CoachLayout = () => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-secondary/30 dark:bg-secondary/10">
            <CoachSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default CoachLayout;
