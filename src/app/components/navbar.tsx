"use client";

import './navbar.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import logo from '../images/brand_logo.svg';
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="nav-bar" ref={menuRef}>
      <Link href='https://travelanimator.com' className="logo-brand-text">
        <Image
          src={logo}
          alt="logo"
          width={50}
          height={50}
          className="logo"
        />
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

      {/* <div className='sign_in_button'>Sign in</div> */}

      <Image
        src="https://travelanimator.com/wp-content/uploads/2025/09/menu_icon.svg"
        alt="Menu"
        width={30}
        height={30}
        className="menu_icon"
        onClick={() => setMenuOpen(!menuOpen)}
      />

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
        {/* <Link href="/">Sign in</Link> */}
      </div>
    </div>
  );
}