"use client";

import './header.css';
import Image from 'next/image';
import Navbar from './navbar';
import Heading from './heading';

export default function Header() {
    return (
    <div className="header">
      <Navbar />

      <Image
        src="https://travelanimator.com/wp-content/uploads/2025/09/cloud1.svg"
        alt="cloud1"
        width={200}
        height={100}
        className="cloud1"
      />
      <Heading/>
      <Image
        src="https://travelanimator.com/wp-content/uploads/2025/09/cloud2.svg"
        alt="cloud2"
        width={200}
        height={100}
        className="cloud2"
      />
    </div>
  );
}