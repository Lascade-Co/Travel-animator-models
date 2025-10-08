"use client";

import './navbar.css';
import logo from '../../images/brand_logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const mobileMenu = (
        <>
            {menuOpen && <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />}
            <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
                <div className="mobile-menu-header">
                    <span className="close-icon" onClick={() => setMenuOpen(false)}>✕</span>
                </div>
                <a href="http://models.travelanimator.com" onClick={() => setMenuOpen(false)}>Models</a>
                <a href="http://support.travelanimator.com" onClick={() => setMenuOpen(false)}>Forum</a>
                <a href="https://airtable.com/appbc8jMEFA2bbnzx/pagwP6ZWi67qw4j3b/form" onClick={() => setMenuOpen(false)}>
                    Collaborate with us
                </a>
                <a href="https://travelanimator.com/hub" onClick={() => setMenuOpen(false)}>Resource Hub</a>
                <a href="mailto:connect@travelanimator.com" onClick={() => setMenuOpen(false)}>Be our partner</a>
                <a href="https://travelanimator.com/release-notes/" onClick={() => setMenuOpen(false)}>Releases</a>
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
                    <a href="http://models.travelanimator.com">Models</a>
                    <a href="http://support.travelanimator.com">Forum</a>
                    <a href="https://airtable.com/appbc8jMEFA2bbnzx/pagwP6ZWi67qw4j3b/form">
                        Collaborate with us
                    </a>
                    <a href="https://travelanimator.com/hub">Resource Hub</a>
                    <a href="mailto:connect@travelanimator.com">Be our partner</a>
                    <a href="https://travelanimator.com/release-notes/">Releases</a>
                </div>

                <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="vector"></div>
                    <div className="vector"></div>
                    <div className="vector"></div>
                </div>
            </div>

            {mounted && createPortal(mobileMenu, document.body)}
        </>
    );
}