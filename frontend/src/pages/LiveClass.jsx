import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Send, MessageSquare, Users } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';

const LiveClass = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [stream, setStream] = useState(null);
    const [peers, setPeers] = useState({}); // { userId: stream }
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showChat, setShowChat] = useState(true);

    const socketRef = useRef();
    const peerRef = useRef();
    const peersRef = useRef({}); // Keep track of peer connections to close them
    const streamRef = useRef();

    useEffect(() => {
        // 1. Initialize Socket
        socketRef.current = io('http://localhost:5001'); // Adjust URL for prod

        // 2. Initialize Peer
        peerRef.current = new Peer(undefined, {
            host: 'peerjs-server.herokuapp.com', // Use public peer server for now
            secure: true,
            port: 443,
        });

        // 3. Get User Media
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(currentStream => {
            setStream(currentStream);
            streamRef.current = currentStream;

            // Handle Incoming Calls
            peerRef.current.on('call', call => {
                call.answer(currentStream);
                call.on('stream', userVideoStream => {
                    // Logic to add new user stream
                    // For simplicity, we might just store by peerId, but let's try mapping to userIds if possible
                    // Ideally we exchange metadata. For now, just use peerId as key.
                    console.log('Received stream from call');
                    setPeers(prev => ({ ...prev, [call.peer]: userVideoStream }));
                });
            });

            // Handle Socket Events
            socketRef.current.on('user-connected', (userId) => {
                connectToNewUser(userId, currentStream);
            });

            socketRef.current.on('receive-message', (message) => {
                setMessages(prev => [...prev, message]);
            });

            socketRef.current.on('user-disconnected', (userId) => {
                if (peersRef.current[userId]) peersRef.current[userId].close();
                setPeers(prev => {
                    const newPeers = { ...prev };
                    delete newPeers[userId];
                    return newPeers;
                });
            });

            // Join Room
            peerRef.current.on('open', (id) => {
                socketRef.current.emit('join-room', roomId, id);
            });
        });

        return () => {
            socketRef.current.disconnect();
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            if (peerRef.current) peerRef.current.destroy();
        };
    }, [roomId]);

    const connectToNewUser = (userId, stream) => {
        const call = peerRef.current.call(userId, stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            setPeers(prev => ({ ...prev, [userId]: userVideoStream }));
        });

        call.on('close', () => {
            // Cleanup
        });

        peersRef.current[userId] = call;
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            user: user?.name || "Anonymous",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: true
        };

        // Emit to others (they see isSelf: false)
        socketRef.current.emit('send-message', roomId, { ...msgData, isSelf: false });

        // Add to local
        setMessages(prev => [...prev, msgData]);
        setNewMessage("");
    };

    const toggleMute = () => {
        const enabled = streamRef.current.getAudioTracks()[0].enabled;
        if (enabled) {
            streamRef.current.getAudioTracks()[0].enabled = false;
            setIsMuted(true);
        } else {
            streamRef.current.getAudioTracks()[0].enabled = true;
            setIsMuted(false);
        }
    };

    const toggleVideo = () => {
        const enabled = streamRef.current.getVideoTracks()[0].enabled;
        if (enabled) {
            streamRef.current.getVideoTracks()[0].enabled = false;
            setIsVideoOff(true);
        } else {
            streamRef.current.getVideoTracks()[0].enabled = true;
            setIsVideoOff(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${showChat ? 'mr-80' : ''}`}>

                {/* Header */}
                <div className="h-16 bg-gray-800/50 backdrop-blur-md flex items-center justify-between px-6 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
                            <Users size={16} />
                        </div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Live Class Setup
                        </h1>
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300 ml-2">
                            {Object.keys(peers).length + 1} Online
                        </span>
                    </div>
                    <button onClick={() => setShowChat(!showChat)} className={`p-2 rounded-full hover:bg-gray-700 transition ${showChat ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                        <MessageSquare size={20} />
                    </button>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                        {/* My Video */}
                        <div className="relative group rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl bg-gray-800 aspect-video">
                            {stream ? (
                                <VideoPlayer stream={stream} isMuted={true} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">Loading Camera...</div>
                            )}
                            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-sm font-medium backdrop-blur-sm">
                                You {isMuted && '(Muted)'}
                            </div>
                        </div>

                        {/* Remote Peers */}
                        {Object.entries(peers).map(([peerId, peerStream]) => (
                            <div key={peerId} className="relative group rounded-xl overflow-hidden border border-gray-700 shadow-xl bg-gray-800 aspect-video">
                                <VideoPlayer stream={peerStream} />
                                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-sm font-medium backdrop-blur-sm">
                                    Student
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="h-20 bg-gray-800/80 backdrop-blur-lg border-t border-gray-700 flex items-center justify-center gap-6 z-10">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all transform hover:scale-110 ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110 px-8 flex items-center gap-2"
                    >
                        <PhoneOff size={24} />
                        <span className="font-semibold">End Class</span>
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all transform hover:scale-110 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 z-20 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-16 p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                    <h2 className="font-bold text-lg">Class Chat</h2>
                    <button onClick={() => setShowChat(false)} className="lg:hidden p-1 hover:bg-gray-700 rounded">
                        <Users size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-600">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.isSelf
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                <p className="font-semibold text-xs opacity-75 mb-1">{msg.user}</p>
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.time}</span>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
                            <p>No messages yet.</p>
                            <p className="text-sm">Be the first to say hi!</p>
                        </div>
                    )}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 bg-gray-900/30">
                    <div className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-gray-700 text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-indigo-600 rounded-full transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LiveClass;
