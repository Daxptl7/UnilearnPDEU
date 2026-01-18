import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footerContainer">
            {/* Main Content Area */}
            <div className="footerContent">

                {/* 1. About Column */}
                <div className="column">
                    <h3>About Us</h3>
                    <p className="footer-description">
                        UniLearn is a cutting-edge platform designed to bridge the gap between students and knowledge. Join us to explore, learn, and grow.
                    </p>
                </div>

                {/* 2. Quick Links */}
                <div className="column">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/courses">Courses</Link></li>
                    </ul>
                </div>

                {/* 3. Contact Info */}
                <div className="column">
                    <h3>Contact Us</h3>
                    <div className="contactItem">
                        <MapPin size={18} className="contactIcon" />
                        <span>Pandit Deendayal Energy University, Raisan, Gandhinagar, Gujarat</span>
                    </div>
                    <div className="contactItem">
                        <Phone size={18} className="contactIcon" />
                        <span>+91 123 456 7890</span>
                    </div>
                    <div className="contactItem">
                        <Mail size={18} className="contactIcon" />
                        <span>idealnab@pdeu.ac.in</span>
                    </div>
                </div>
            </div>

            {/* Bottom Red Bar */}
            <div className="bottomBar">
                <div className="bottomContainer">
                    <div className="leftSection">
                        <h2>UniLearn</h2>
                        <span style={{ fontSize: '14px', opacity: 0.8 }}>Empowering Learners, Transforming Futures</span>
                    </div>

                    <div className="rightSection">
                        <div className="socialWrapper">
                            <a href="#" className="socialBox"><Instagram size={20} /></a>
                            <a href="#" className="socialBox"><Linkedin size={20} /></a>
                            <a href="#" className="socialBox"><Twitter size={20} /></a>
                        </div>
                        <p className="copyright">© {new Date().getFullYear()} UniLearn. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
