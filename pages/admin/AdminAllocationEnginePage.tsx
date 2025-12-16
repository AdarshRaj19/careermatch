import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/Button';
import { api } from '../../services/api';

const AdminAllocationEnginePage: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [skillWeight, setSkillWeight] = useState(60);
    const [preferenceWeight, setPreferenceWeight] = useState(25);
    const [fairnessBoost, setFairnessBoost] = useState(15);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Auto-scroll log container
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, [logs]);

    const startAllocation = async () => {
        setIsRunning(true);
        setLogs([]);

        try {
            const response = await fetch('http://localhost:3001/api/admin/allocation-engine/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ skillWeight, preferenceWeight, fairnessBoost })
            });

            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setLogs(prevLogs => [...prevLogs, ...chunk.split('\n').filter(Boolean)]);
            }

        } catch (error) {
            console.error("Allocation failed:", error);
            setLogs(prev => [...prev, `ERROR: ${(error as Error).message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">Live Process Monitor</h2>
                <p className="text-sm text-gray-500">Real-time logs of the allocation engine.</p>
                <div ref={logContainerRef} className="mt-4 bg-gray-900 text-white font-mono text-sm p-4 rounded-md h-96 overflow-y-auto">
                    {logs.map((log, i) => <p key={i} className="whitespace-pre-wrap">{log}</p>)}
                    {isRunning && <div className="animate-pulse">_</div>}
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold">Engine Control</h2>
                 <p className="text-sm text-gray-500">Adjust policy levers and manage the allocation process.</p>
                 
                <div className="my-6 space-y-4">
                    <div>
                        <label className="font-medium text-sm">Skill Match Weight ({skillWeight}%)</label>
                        <input type="range" min="0" max="100" value={skillWeight} onChange={e => setSkillWeight(Number(e.target.value))} className="w-full mt-1" />
                    </div>
                     <div>
                        <label className="font-medium text-sm">Student Preference Weight ({preferenceWeight}%)</label>
                        <input type="range" min="0" max="100" value={preferenceWeight} onChange={e => setPreferenceWeight(Number(e.target.value))} className="w-full mt-1" />
                    </div>
                     <div>
                        <label className="font-medium text-sm">Fairness Boost ({fairnessBoost}%)</label>
                        <input type="range" min="0" max="100" value={fairnessBoost} onChange={e => setFairnessBoost(Number(e.target.value))} className="w-full mt-1" />
                    </div>
                </div>

                 <div className="p-4 border rounded-lg text-center">
                    <p className="font-semibold">{isRunning ? "Allocation in progress..." : "Ready to start allocation."}</p>
                    <Button onClick={startAllocation} disabled={isRunning} className="w-full mt-4">
                        {isRunning ? 'Running...' : 'Start Allocation'}
                    </Button>
                 </div>
                 <p className="text-xs text-gray-500 mt-4 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                    Warning: Running the allocation process will affect all unmatched students and open internship slots. This action is irreversible.
                 </p>
            </div>
        </div>
    );
};
export default AdminAllocationEnginePage;