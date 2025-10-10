import './maps_header.css';
import Navbar from './navbar';
import Image from 'next/image';
import cloud1 from '../../images/cloud_1.png';
import cloud2 from '../../images/cloud_2.png';

export default function Header() {
    return (
        <>
            <div className="header">
                <Navbar />

                <Image src={cloud1} alt='Cloud_1' width={50} height={50} className='cloud_1' />
                <Image src={cloud2} alt='Cloud_2' width={50} height={50} className='cloud_2' />

                <svg width="800" height="300" viewBox="0 0 800 300" className='curved_text'>

                    <defs>
                        <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
                        </filter>
                    </defs>

                    <path id="curve1" d="M 50 200 Q 400 80 750 200" fill="transparent" />


                    <path id="curve2" d="M 80 240 Q 400 120 720 240" fill="transparent" />


                    <text fill="var(--foreground)" textAnchor="middle" className='vibrant_maps' filter="url(#textShadow)" >
                        <textPath href="#curve1" startOffset="50%" >
                            Vibrant Maps
                        </textPath>
                    </text>


                    <text fill="var(--foreground)" textAnchor="middle" className='sub_text' filter="url(#textShadow)" >
                        <textPath href="#curve2" startOffset="50%">
                            That Bring Every Journey Alive
                        </textPath>
                    </text>
                </svg>
            </div>
        </>
    );
}