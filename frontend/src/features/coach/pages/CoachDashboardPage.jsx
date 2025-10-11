import { motion } from 'framer-motion';
import { Video, BarChart2 } from 'lucide-react';

const kpiData = [
    { title: "Total Videos Uploaded", value: "24", icon: Video },
    { title: "Total Views", value: "15,830", icon: BarChart2 },
];

const CoachDashboardPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Welcome back, Coach!</h1>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
            >
                {kpiData.map((kpi) => (
                    <motion.div
                        key={kpi.title}
                        className="bg-background p-6 rounded-lg border"
                        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-muted-foreground font-medium">{kpi.title}</h3>
                            <div className="p-2 bg-secondary rounded-md">
                                <kpi.icon className="text-secondary-foreground" size={22} />
                            </div>
                        </div>
                        <p className="text-4xl font-bold">{kpi.value}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default CoachDashboardPage;
