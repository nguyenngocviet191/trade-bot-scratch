import React, { useEffect, useState } from 'react';

type Message = {
    action: string;
    received_at: string;
};

type ChannelInfo = {
    channel: string;
    message_count: number;
    latest_message: Message;
};
export default function HookSignalPage() {
    const [channels, setChannels] = useState<ChannelInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Trong fetchData:
   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/hook');
                const data = await res.json();
                setChannels(data.channels || []);
                setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 5000); // fetch mỗi 5 giây
        return () => clearInterval(intervalId); // Dọn dẹp interval khi component unmount
    }, []);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Channel Summary</h1>
            {loading ? (
                <p className="text-gray-600">Đang tải dữ liệu...</p>
            ) : (
                <div className="overflow-x-auto">
                    <p className="text-sm text-gray-500">
                        {lastUpdated && `Cập nhật lúc: ${lastUpdated}`}
                    </p>
                    <table className="w-full table-auto border border-gray-300 shadow-sm rounded-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Channel</th>
                                <th className="px-4 py-2 text-left">Số tin nhắn</th>
                                <th className="px-4 py-2 text-left">Hành động mới nhất</th>
                                <th className="px-4 py-2 text-left">Thời gian nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {channels.map((ch) => (
                                <tr key={ch.channel} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{ch.channel}</td>
                                    <td className="px-4 py-2">{ch.message_count}</td>
                                    <td className="px-4 py-2">{ch.latest_message?.action ?? '-'}</td>
                                    <td className="px-4 py-2">{ch.latest_message?.received_at ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}