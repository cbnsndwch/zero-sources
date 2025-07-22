import { useState, useEffect } from 'react';
// import type { Route } from './+types/zrocket.js';

export default function ZRocketDemo() {
    const [demoInfo, setDemoInfo] = useState<any>(null);
    const [seedStatus, setSeedStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch demo info when component mounts
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8012';
        fetch(`${apiUrl}/zrocket/demo-info`)
            .then(res => res.json())
            .then(setDemoInfo)
            .catch(console.error);
    }, []);

    const seedData = async () => {
        setLoading(true);
        setSeedStatus('Seeding data...');
        try {
            const apiUrl =
                import.meta.env.VITE_API_URL || 'http://localhost:8012';
            const response = await fetch(`${apiUrl}/zrocket/seed-data`, {
                method: 'POST'
            });
            const result = await response.json();
            setSeedStatus(
                result.success
                    ? 'Data seeded successfully!'
                    : `Error: ${result.message}`
            );
        } catch (error) {
            setSeedStatus(
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        } finally {
            setLoading(false);
        }
    };

    if (!demoInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading ZRocket Demo...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Make sure the ZRocket API server is running on port 8012
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        <span role="img" aria-label="to the moon!">
                            🚀
                        </span>{' '}
                        {demoInfo.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {demoInfo.description}
                    </p>
                </div>

                {/* Seed Data Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        <span role="img" aria-label="save icon">
                            💾
                        </span>{' '}
                        Sample Data
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Seed the MongoDB database with sample data to see
                        discriminated union tables in action.
                    </p>
                    <button
                        onClick={seedData}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Seeding...' : 'Seed Sample Data'}
                    </button>
                    {seedStatus && (
                        <p
                            className={`mt-3 ${seedStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}
                        >
                            {seedStatus}
                        </p>
                    )}
                </div>

                {/* Table Mappings */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {Object.entries(demoInfo.tables).map(
                        ([sourceType, tables]: [string, any]) => (
                            <div
                                key={sourceType}
                                className="bg-white rounded-lg shadow-md p-6"
                            >
                                <h3 className="text-xl font-semibold mb-4 text-center">
                                    {sourceType === 'fromRoomsCollection' &&
                                        '🏠 Rooms Collection'}
                                    {sourceType === 'fromMessagesCollection' &&
                                        '💬 Messages Collection'}
                                    {sourceType ===
                                        'fromParticipantsCollection' &&
                                        '👥 Participants Collection'}
                                </h3>
                                <div className="space-y-3">
                                    {tables.map((table: any, index: number) => (
                                        <div
                                            key={index}
                                            className="border-l-4 border-blue-400 pl-4"
                                        >
                                            <h4 className="font-semibold text-gray-800">
                                                {table.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {table.description}
                                            </p>
                                            <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                                                {JSON.stringify(table.filter)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Features */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">✨ Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {demoInfo.features.map(
                            (feature: string, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-2"
                                >
                                    <span className="text-green-500 mt-1">
                                        ✓
                                    </span>
                                    <span className="text-gray-700">
                                        {feature}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* API Endpoints */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        🔗 API Endpoints
                    </h2>
                    <div className="space-y-2">
                        {demoInfo.endpoints.map(
                            (endpoint: string, index: number) => (
                                <div
                                    key={index}
                                    className="font-mono text-sm bg-gray-100 p-2 rounded"
                                >
                                    {endpoint}
                                </div>
                            )
                        )}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">
                            <strong>💡 Tip:</strong> Check the Swagger
                            documentation at{' '}
                            <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:8012'}/api-docs`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600"
                            >
                                {import.meta.env.VITE_API_URL ||
                                    'http://localhost:8012'}
                                /api-docs
                            </a>
                        </p>
                    </div>
                </div>

                {/* Architecture Diagram */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        🏗️ Architecture
                    </h2>
                    <div className="text-center">
                        <div className="inline-block text-left max-w-4xl">
                            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                {`MongoDB Collections          Zero Tables
┌─────────────────┐         ┌─────────────────┐
│     rooms       │────────▶│     chats       │ (t: 'd')
│  (all rooms)    │────────▶│     groups      │ (t: 'p')  
│                 │────────▶│     channels    │ (t: 'c')
└─────────────────┘         └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│    messages     │────────▶│  textMessages   │ (t: 'text')
│ (all messages)  │────────▶│  imageMessages  │ (t: 'image')
│                 │────────▶│  systemMessages │ (t: 'system')
└─────────────────┘         └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│  participants   │────────▶│ userParticipants│ (type: 'user')
│(all participants)│────────▶│ botParticipants │ (type: 'bot')
└─────────────────┘         └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│     users       │────────▶│     users       │ (1:1 mapping)
└─────────────────┘         └─────────────────┘`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
