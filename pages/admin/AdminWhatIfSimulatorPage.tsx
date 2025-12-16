
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../services/api';

const AdminWhatIfSimulatorPage: React.FC = () => {
    const [skillWeight, setSkillWeight] = useState(60);
    const [preferenceWeight, setPreferenceWeight] = useState(25);
    const [fairnessBoost, setFairnessBoost] = useState(15);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingInitial, setIsFetchingInitial] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await api.get('/admin/what-if-simulator/initial-data');
                setChartData(response);
            } catch (error) {
                console.error("Failed to fetch initial simulator data:", error);
            } finally {
                setIsFetchingInitial(false);
            }
        };
        fetchInitialData();
    }, []);

    const runSimulation = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/admin/what-if-simulator/run', {
                skillWeight,
                preferenceWeight,
                fairnessBoost
            });
            setChartData(response);
        } catch (error) {
            console.error("Simulation failed:", error);
            alert("Failed to run simulation.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">Policy Levers</h2>
                <p className="text-sm text-gray-500">Adjust the weights for different factors in the allocation algorithm.</p>
                <div className="mt-6 space-y-6">
                    <div>
                        <label className="font-medium">Skill Match Weight ({skillWeight}%)</label>
                        <input type="range" min="0" max="100" value={skillWeight} onChange={e => setSkillWeight(Number(e.target.value))} className="w-full mt-2" />
                    </div>
                     <div>
                        <label className="font-medium">Student Preference Weight ({preferenceWeight}%)</label>
                        <input type="range" min="0" max="100" value={preferenceWeight} onChange={e => setPreferenceWeight(Number(e.target.value))} className="w-full mt-2" />
                    </div>
                     <div>
                        <label className="font-medium">Fairness Boost ({fairnessBoost}%)</label>
                        <input type="range" min="0" max="100" value={fairnessBoost} onChange={e => setFairnessBoost(Number(e.target.value))} className="w-full mt-2" />
                    </div>
                </div>
                <Button onClick={runSimulation} className="w-full mt-8" disabled={isLoading}>
                    {isLoading ? 'Simulating...' : 'Run Simulation'}
                </Button>
            </div>
             <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">Simulated Outcomes</h2>
                <p className="text-sm text-gray-500">Comparison of current allocation vs. simulated allocation based on your new weights.</p>
                 <div style={{ width: '100%', height: 400 }} className="mt-4">
                    {isFetchingInitial ? (
                        <p>Loading chart data...</p>
                    ) : (
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} unit="%" />
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Legend />
                                <Bar dataKey="Current" fill="#8884d8" />
                                <Bar dataKey="Simulated" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};
export default AdminWhatIfSimulatorPage;
