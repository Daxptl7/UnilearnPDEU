import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
    Video, Mic, MicOff, VideoOff, PhoneOff, Send,
    MessageSquare, Users, Settings, Share, MoreVertical,
    Maximize2, Copy, Check
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

const LiveClass = () => {
    const { roomId } = useParams();
    const { user } = useAuth() || {};
    const navigate = useNavigate();

    // State
    const [stream, setStream] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [peerData, setPeerData] = useState({}); // socketId -> { name, role }
    const [copied, setCopied] = useState(false); // For Copy Button feedback

    // Connection Refs
    const socketRef = useRef();
    const connections = useRef({}); // socketId -> RTCPeerConnection
    const [videos, setVideos] = useState([]); // For rendering

    // Constants
    const peerConfigConnections = {
        "iceServers": [
            { "urls": "stun:stun.l.google.com:19302" }
        ]
    };

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Main WebRTC Logic
    useEffect(() => {
        // Define async function inside useEffect to handle await
        const init = async () => {
            try {
                // 1. Get User Media FIRST
                const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(currentStream);
                window.localStream = currentStream;
                console.log("LOG: Media stream acquired", currentStream.id);

                // 2. Initialize Socket AFTER media is ready
                socketRef.current = io(config.SOCKET_URL);
                console.log("LOG: Socket initialized");

                // Socket Event Handlers
                const handleChatMessage = (data, sender, socketIdSender) => {
                    setMessages(prev => {
                        return [...prev, {
                            user: sender,
                            text: data,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isSelf: socketIdSender === socketRef.current.id
                        }];
                    });
                };

                const handleUserLeft = (id) => {
                    console.log("LOG: User left", id);
                    setVideos((videos) => videos.filter((video) => video.socketId !== id));
                    // Also cleanup peer connection
                    if (connections.current[id]) {
                        connections.current[id].close();
                        delete connections.current[id];
                    }
                };

                const handleUserJoined = (id, clientList) => {
                    console.log("LOG: User joined:", id, "My ID:", socketRef.current.id);
                    console.log("LOG: Client list:", clientList);

                    // Build map of new peer data
                    const newPeerData = {};
                    clientList.forEach(client => {
                        newPeerData[client.socketId] = { name: client.name, role: client.role };
                    });

                    // Merge with existing peerData to avoid losing info (though clientList usually full state)
                    setPeerData(prev => ({ ...prev, ...newPeerData }));

                    clientList.forEach((client) => {
                        const socketListId = client.socketId;

                        if (connections.current[socketListId]) {
                            console.log("LOG: Connection already exists for", socketListId);
                            return;
                        }
                        if (socketListId === socketRef.current.id) return; // Don't connect to self

                        console.log("LOG: Initiating connection for", socketListId);

                        const peerConnection = new RTCPeerConnection(peerConfigConnections);
                        connections.current[socketListId] = peerConnection;

                        peerConnection.onicecandidate = function (event) {
                            if (event.candidate != null) {
                                console.log("LOG: Sending ICE to", socketListId);
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        }

                        peerConnection.ontrack = (event) => {
                            console.log("LOG: Track received from", socketListId, event.streams);
                            const remoteStream = event.streams[0];
                            setVideos(prev => {
                                const exists = prev.find(v => v.socketId === socketListId);
                                if (exists) return prev;
                                return [...prev, { socketId: socketListId, stream: remoteStream }];
                            });
                        };

                        // Add Local Stream - NOW GUARANTEED TO EXIST
                        if (window.localStream) {
                            console.log("LOG: Adding local tracks to", socketListId);
                            window.localStream.getTracks().forEach(track => {
                                peerConnection.addTrack(track, window.localStream);
                            });
                        }

                        // If I just joined (id === my_id), I initiate calls to everyone else
                        if (id === socketRef.current.id) {
                            console.log("LOG: Creating OFFER for", socketListId);
                            peerConnection.createOffer().then((description) => {
                                peerConnection.setLocalDescription(description).then(() => {
                                    socketRef.current.emit('signal', socketListId, JSON.stringify({ 'sdp': peerConnection.localDescription }));
                                });
                            });
                        }
                    });
                };

                const handleSignal = (fromId, message) => {
                    console.log("LOG: Signal received from", fromId);
                    var signal = JSON.parse(message);

                    // Ensure connection exists
                    if (!connections.current[fromId]) {
                        console.log("LOG: Creating new connection (Answerer) for", fromId);
                        // If we receive a signal from someone we don't have a connection with yet, create it (ANSWERER side usually)
                        const peerConnection = new RTCPeerConnection(peerConfigConnections);
                        connections.current[fromId] = peerConnection;

                        peerConnection.onicecandidate = function (event) {
                            if (event.candidate != null) {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };

                        peerConnection.ontrack = (event) => {
                            console.log("LOG: Track received from", fromId);
                            const remoteStream = event.streams[0];
                            setVideos(prev => {
                                const exists = prev.find(v => v.socketId === fromId);
                                if (exists) return prev;
                                return [...prev, { socketId: fromId, stream: remoteStream }];
                            });
                        };

                        if (window.localStream) {
                            console.log("LOG: Adding local tracks for answerer", fromId);
                            window.localStream.getTracks().forEach(track => {
                                peerConnection.addTrack(track, window.localStream);
                            });
                        }
                    }

                    const peerConnection = connections.current[fromId];

                    if (signal.sdp) {
                        console.log("LOG: Received SDP type:", signal.sdp.type);
                        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                            if (signal.sdp.type === 'offer') {
                                console.log("LOG: Creating ANSWER for", fromId);
                                peerConnection.createAnswer().then((description) => {
                                    peerConnection.setLocalDescription(description).then(() => {
                                        socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': peerConnection.localDescription }));
                                    });
                                });
                            }
                        });
                    }

                    if (signal.ice) {
                        console.log("LOG: Received ICE candidate");
                        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                    }
                };

                // Attach Listeners
                socketRef.current.on('connect', () => {
                    // Pass user metadata (name, role, userId)
                    socketRef.current.emit('join-call', roomId, {
                        name: user?.name || "User",
                        role: user?.role || "student",
                        userId: user?._id
                    });
                });

                socketRef.current.on('error', (err) => {
                    alert(err);
                    navigate('/dashboard'); // Redirect if unauthorized
                });

                socketRef.current.on('signal', handleSignal);
                socketRef.current.on('chat-message', handleChatMessage);
                socketRef.current.on('user-left', handleUserLeft);
                socketRef.current.on('user-joined', handleUserJoined);


            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        // Run Init
        init();

        // Cleanup
        return () => {
            // Remove Listeners
            if (socketRef.current) {
                socketRef.current.off('signal');
                socketRef.current.off('chat-message');
                socketRef.current.off('user-left');
                socketRef.current.off('user-joined');
                socketRef.current.off('error');
                socketRef.current.disconnect();
            }

            // Stop Config Tracks
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
                window.localStream = null;
            }

            // Close Peer Connections
            Object.values(connections.current).forEach(conn => conn.close());
            connections.current = {};
        }
    }, [roomId, user]); // Added user to dependencies to ensure we send correct role


    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        socketRef.current.emit('chat-message', newMessage, user?.name || "Anonymous");
        setNewMessage("");
    };

    const toggleMute = () => {
        if (stream) {
            const enabled = stream.getAudioTracks()[0].enabled;
            stream.getAudioTracks()[0].enabled = !enabled;
            setIsMuted(enabled); // Logic fixed previously
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const enabled = stream.getVideoTracks()[0].enabled;
            stream.getVideoTracks()[0].enabled = !enabled;
            setIsVideoOff(enabled); // Logic fixed previously
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex h-full w-full bg-gray-50 dark:bg-[#0f0f1a] text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">

            {/* Background Gradient (Subtle Light) - Adjusted for Dark */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] animate-blob" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-100 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] animate-blob animation-delay-4000" />
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col relative z-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${showChat ? 'mr-[380px]' : 'mr-0'}`}>

                {/* Header (Floating & Light) */}
                <div className="h-24 px-8 flex items-center justify-between z-20">
                    <div className="glass-panel-light dark:bg-white/5 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center gap-5 shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-white/60 bg-white/70 backdrop-blur-md group hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Video size={22} className="text-white" />
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Advanced Web Development</h1>
                            <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 tracking-wider">LIVE</span>
                                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass-panel-light dark:bg-white/5 dark:border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-4 text-gray-600 dark:text-gray-300 bg-white/70 backdrop-blur-md border border-white/60 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-indigo-500 dark:text-indigo-400" />
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{videos.length + 1}</span>
                            </div>

                            {/* Copy Code Button Implementation */}
                            <button
                                onClick={handleCopyCode}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent"
                                title="Copy Meeting Code"
                            >
                                {copied ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Copy size={16} />}
                                <span className="text-xs font-mono">{roomId}</span>
                            </button>

                            <span className="w-px h-4 bg-gray-300 dark:bg-white/20" />
                            <span className="text-sm font-mono tracking-wider text-gray-500 dark:text-gray-400">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {!showChat && (
                            <button
                                onClick={() => setShowChat(true)}
                                className="p-3.5 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-100 dark:border-transparent"
                            >
                                <MessageSquare size={20} className="fill-current" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Video Grid Area */}
                <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar-light">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full content-center max-w-[1600px] mx-auto">

                        {/* Local User */}
                        <div className="relative group rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-white dark:bg-[#1e1e2e] border border-white dark:border-white/5 ring-1 ring-gray-100 dark:ring-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-500/30">
                            {stream ? (
                                <VideoPlayer stream={stream} isMuted={true} />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#151520] text-gray-400 dark:text-gray-500">
                                    <div className="relative w-16 h-16 mb-4">
                                        <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <span className="text-sm font-medium tracking-wide">INITIALIZING FEED</span>
                                </div>
                            )}

                            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-sm border border-white/50 dark:border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    {/* Display Role Label based on current user */}
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-wide">
                                        {(user?.role === 'teacher' || user?.role === 'admin') ? "INSTRUCTOR (YOU)" : "STUDENT (YOU)"}
                                    </span>
                                </div>
                                {isMuted && (
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center shadow-sm animate-pulse">
                                        <MicOff size={14} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remote Peers */}
                        {videos.map((video) => {
                            // Determine role label for remote peer
                            const role = peerData[video.socketId]?.role;
                            const name = peerData[video.socketId]?.name || "User";
                            const isInstructor = role === 'teacher' || role === 'admin';

                            return (
                                <div key={video.socketId} className="relative group rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-white dark:bg-[#1e1e2e] border border-white dark:border-white/5 ring-1 ring-gray-100 dark:ring-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-500/10 hover:border-purple-100 dark:hover:border-purple-500/30">
                                    <VideoPlayer stream={video.stream} />
                                    <div className="absolute bottom-5 left-5">
                                        <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-white/50 dark:border-white/10">
                                            <span className={`text-xs font-bold tracking-wide ${isInstructor ? "text-indigo-600 dark:text-indigo-400" : "text-gray-800 dark:text-gray-200"}`}>
                                                {isInstructor ? "INSTRUCTOR" : "STUDENT"} - {name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Control Dock */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                    <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl p-2 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 flex items-center gap-2 border border-white/50 dark:border-white/10 scale-100 hover:scale-[1.01] transition-transform duration-300">
                        <ControlBtn
                            onClick={toggleMute}
                            active={!isMuted} // Corrected logic: Active = Not Muted
                            onIcon={<Mic size={20} />}
                            offIcon={<MicOff size={20} />}
                            activeClass="bg-gray-100 dark:bg-white/20 hover:bg-gray-200 dark:hover:bg-white/30 text-gray-800 dark:text-white shadow-sm"
                            offClass="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                        />
                        <ControlBtn
                            onClick={toggleVideo}
                            active={!isVideoOff} // Corrected logic: Active = Not Video Off
                            onIcon={<Video size={20} />}
                            offIcon={<VideoOff size={20} />}
                            activeClass="bg-gray-100 dark:bg-white/20 hover:bg-gray-200 dark:hover:bg-white/30 text-gray-800 dark:text-white shadow-sm"
                            offClass="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                        />

                        <div className="w-px h-10 bg-gray-200 dark:bg-white/20 mx-2" />

                        <ControlBtn onClick={() => { }} icon={<Share size={20} />} tooltip="Share Screen" />
                        <ControlBtn onClick={() => { }} icon={<Settings size={20} />} tooltip="Settings" />
                        <ControlBtn onClick={() => { }} icon={<Maximize2 size={20} />} tooltip="Fullscreen" />

                        <div className="w-px h-10 bg-gray-200 dark:bg-white/20 mx-2" />

                        <button
                            onClick={() => navigate(-1)}
                            className="h-14 px-8 rounded-2xl bg-white dark:bg-white/5 border-2 border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group"
                        >
                            <PhoneOff size={20} className="group-hover:animate-pulse" />
                            <span className="font-bold text-sm tracking-wide">END CALL</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Chat Sidebar (Light) */}
            <div className={`fixed right-0 top-0 h-full w-[380px] bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl border-l border-gray-100 dark:border-gray-800 shadow-[-20px_0_100px_rgba(0,0,0,0.05)] transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-40 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="h-24 flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-50/50 dark:from-white/5 to-transparent">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Live Chat</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-xs font-medium text-gray-400">Online & Active</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowChat(false)}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-200"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar-light">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-80">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-white/5">
                                <MessageSquare size={32} className="stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs opacity-75 mt-1">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`group flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className="flex items-end gap-3 max-w-[85%]">
                                    {!msg.isSelf && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-100 to-fuchsia-100 dark:from-violet-900 dark:to-fuchsia-900 flex-shrink-0 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-300 shadow-sm ring-2 ring-white dark:ring-gray-800">
                                            {msg.user[0]}
                                        </div>
                                    )}
                                    <div>
                                        {!msg.isSelf && <p className="text-[10px] text-gray-400 mb-1 ml-1">{msg.user}</p>}
                                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isSelf
                                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm shadow-indigo-200 dark:shadow-none'
                                            : 'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-white/5 shadow-gray-200/50 dark:shadow-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.time}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#18181b]">
                    <form onSubmit={sendMessage} className="relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-white dark:bg-white/5 text-gray-800 dark:text-gray-100 text-sm rounded-2xl py-4 pl-5 pr-14 border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-gray-400 shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl opacity-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-500/20"
                        >
                            <Send size={18} className="fill-current" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper for Control Buttons with refined styling
const ControlBtn = ({ onClick, active = true, onIcon, offIcon, icon, activeClass, offClass, tooltip }) => {
    const baseClass = "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 group relative";
    const defaultClass = "bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200";

    return (
        <button onClick={onClick} className={`${baseClass} ${onIcon ? (active ? activeClass : offClass) : defaultClass}`} title={tooltip}>
            {onIcon ? (active ? onIcon : offIcon) : icon}
        </button>
    );
};

export default LiveClass;
