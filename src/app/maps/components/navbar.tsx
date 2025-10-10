"use client";

import './navbar.css';
import logo from '../../images/logo.webp';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import android from '../../images/android.png';
import apple from '../../images/apple.png';
import qrcode from '../../images/qrcode.png';

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const detectDevice = () => {
        const userAgent = navigator.userAgent || navigator.vendor;

        if (/android/i.test(userAgent)) {
            return 'android';
        }
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            return 'ios';
        }
        return 'desktop';
    };

    const handleGetAppClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        const device = detectDevice();
        const isMobileOrTablet = window.innerWidth <= 1080;

        if (isMobileOrTablet && device === 'android') {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.travelanimator.routemap';
        } else if (isMobileOrTablet && device === 'ios') {            
            window.location.href = 'https://apps.apple.com/in/app/travelanimator-journey-route/id6462844561';
        } else {
            setPopupOpen(true);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }

            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                popupOpen
            ) {
                setPopupOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [popupOpen]);

    const mobileMenu = (
        <>
            {menuOpen && <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />}
            <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
                <div className="mobile-menu-header">
                    <span className="close-icon" onClick={() => setMenuOpen(false)}>✕</span>
                </div>
                <Link href="http://models.travelanimator.com" onClick={() => setMenuOpen(false)}>Models</Link>
                <Link href="https://models.travelanimator.com/maps" onClick={() => setMenuOpen(false)}>Maps</Link>
                <Link href="http://support.travelanimator.com" onClick={() => setMenuOpen(false)}>Forum</Link>
                <Link href="https://airtable.com/appbc8jMEFA2bbnzx/pagwP6ZWi67qw4j3b/form" onClick={() => setMenuOpen(false)}>
                    Collaborate with us
                </Link>
                <Link href="https://travelanimator.com/hub" onClick={() => setMenuOpen(false)}>Resource Hub</Link>
                <Link href="mailto:connect@travelanimator.com" onClick={() => setMenuOpen(false)}>Be our partner</Link>
                <Link href="https://travelanimator.com/release-notes/" onClick={() => setMenuOpen(false)}>Releases</Link>
            </div>
        </>
    );

    return (
        <>
            <div className="navbar" ref={menuRef} >
                <Link href='https://travelanimator.com'>
                    <Image className='brand_logo' src={logo} alt="Brand Logo" width={200} height={200} />
                </Link>

                <div className="menu">
                    <Link href="/">Models</Link>
                    <Link href="/maps">Maps</Link>
                    <Link href="http://support.travelanimator.com">Forum</Link>
                    <Link href="https://airtable.com/appbc8jMEFA2bbnzx/pagwP6ZWi67qw4j3b/form">
                        Collaborate with us
                    </Link>
                    <Link href="https://travelanimator.com/hub">Resource Hub</Link>
                    <Link href="mailto:connect@travelanimator.com">Be our partner</Link>
                    <Link href="https://travelanimator.com/release-notes/">Releases</Link>
                </div>

                <div className="get-app-btn" onClick={handleGetAppClick}>
                    Get App
                </div>

                <div className="mobile-navbar">
                    <div className="get-app-btn-mobile" onClick={handleGetAppClick}>
                        Get App
                    </div>
                    <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
                        <div className="vector"></div>
                        <div className="vector"></div>
                        <div className="vector"></div>
                    </div>
                </div>
            </div>

            {mounted && createPortal(mobileMenu, document.body)}

            {mounted && popupOpen && createPortal(
                <div className="popup-overlay">
                    <div className="popup-container" ref={popupRef}>
                        <div className="text-content">
                            <div className="text-content-1">
                                Your Journey Starts Here
                            </div>
                            <div className="text-content-2">
                                Scan the QR code to launch Travel Animator on your device.
                            </div>
                            <div className="device-icons">
                                <Image src={android} alt='android_icon' width={30} height={30} />
                                <Image src={apple} alt='apple_icon' width={30} height={30} />
                            </div>
                        </div>
                        <div className="qr-code">
                            <Image src={qrcode} alt='qrcode' width={260} height={260} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}